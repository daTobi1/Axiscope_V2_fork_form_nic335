import os
import ast
from . import tools_calibrate
from . import toolchanger

class Axiscope:
    def __init__(self, config):
        self.printer       = config.get_printer()
        self.gcode         = self.printer.lookup_object('gcode')
        self.gcode_move    = self.printer.load_object(config, 'gcode_move')

        self.x_pos         = config.getfloat('zswitch_x_pos', None)
        self.y_pos         = config.getfloat('zswitch_y_pos', None)
        self.z_pos         = config.getfloat('zswitch_z_pos', None)

        self.lift_z        = config.getfloat('lift_z', 1.0)
        self.safe_start_z  = config.getfloat('safe_start_z', 6.0, minval=0.)

        self.move_speed    = config.getint('move_speed', 60)
        self.z_move_speed  = config.getint('z_move_speed', 10)

        self.samples               = config.getint('samples', 10)
        self.samples_tolerance     = config.getfloat('samples_tolerance', 0.02, minval=0.)
        self.samples_max_count     = config.getint('samples_max_count', self.samples, minval=self.samples)

        self.pin              = config.get('pin', None)
        self.config_file_path = config.get('config_file_path', None)

        # Recovery gegen "Probe triggered prior to movement"
        self.recover_lift_mm      = config.getfloat('recover_lift_mm', 2.0, minval=0.)
        self.recover_pause_ms     = config.getint('recover_pause_ms', 150, minval=0)
        self.recover_max_attempts = config.getint('recover_max_attempts', 4, minval=1)

        self.gcode_macro = self.printer.load_object(config, 'gcode_macro')
        self.start_gcode = self.gcode_macro.load_template(config, 'start_gcode', '')
        self.before_pickup_gcode = self.gcode_macro.load_template(config, 'before_pickup_gcode', '')
        self.after_pickup_gcode  = self.gcode_macro.load_template(config, 'after_pickup_gcode', '')
        self.finish_gcode        = self.gcode_macro.load_template(config, 'finish_gcode', '')

        self.has_cfg_data = False
        self.probe_results = {}

        if self.pin is not None:
            self.probe_multi_axis = tools_calibrate.PrinterProbeMultiAxis(
                config,
                tools_calibrate.ProbeEndstopWrapper(config, 'x'),
                tools_calibrate.ProbeEndstopWrapper(config, 'y'),
                tools_calibrate.ProbeEndstopWrapper(config, 'z')
            )
            query_endstops = self.printer.load_object(config, 'query_endstops')
            query_endstops.register_endstop(
                self.probe_multi_axis.mcu_probe[-1].mcu_endstop,
                "Axiscope"
            )
        else:
            self.probe_multi_axis = None

        self.toolchanger = self.printer.load_object(config, 'toolchanger')
        self.printer.register_event_handler("klippy:connect", self.handle_connect)

        self.gcode.register_command('MOVE_TO_ZSWITCH', self.cmd_MOVE_TO_ZSWITCH)
        self.gcode.register_command('PROBE_ZSWITCH', self.cmd_PROBE_ZSWITCH)
        self.gcode.register_command('CALIBRATE_ALL_Z_OFFSETS', self.cmd_CALIBRATE_ALL_Z_OFFSETS)

        self.gcode.register_command('AXISCOPE_START_GCODE', self.cmd_AXISCOPE_START_GCODE)
        self.gcode.register_command('AXISCOPE_BEFORE_PICKUP_GCODE', self.cmd_AXISCOPE_BEFORE_PICKUP_GCODE)
        self.gcode.register_command('AXISCOPE_AFTER_PICKUP_GCODE', self.cmd_AXISCOPE_AFTER_PICKUP_GCODE)
        self.gcode.register_command('AXISCOPE_FINISH_GCODE', self.cmd_AXISCOPE_FINISH_GCODE)

    def handle_connect(self):
        if self.config_file_path:
            self.config_file_path = os.path.expanduser(self.config_file_path)
            if os.path.exists(self.config_file_path):
                self.has_cfg_data = True
                self.gcode.respond_info(f"Axiscope config file found ({self.config_file_path})")
            else:
                self.gcode.respond_info(f"Axiscope config file not found ({self.config_file_path})")

    def is_homed(self):
        toolhead = self.printer.lookup_object('toolhead')
        homed = toolhead.get_kinematics().get_status(
            self.printer.get_reactor().monotonic()
        )['homed_axes']
        return all(a in homed for a in 'xyz')

    def has_switch_pos(self):
        return all(v is not None for v in (self.x_pos, self.y_pos, self.z_pos))

    def cmd_MOVE_TO_ZSWITCH(self, gcmd):
        if not self.is_homed():
            gcmd.respond_error("Must home first")
            return
        if not self.has_switch_pos():
            gcmd.respond_error("Z switch positions invalid")
            return

        toolhead = self.printer.lookup_object('toolhead')
        toolhead.wait_moves()
        cur = toolhead.get_position()

        self.gcode_move.cmd_G1(
            self.gcode.create_gcode_command(
                "G0", "G0",
                {'X': self.x_pos, 'Y': self.y_pos, 'Z': cur[2], 'F': self.move_speed * 60}
            )
        )

        target_z = max(self.z_pos + self.lift_z, self.safe_start_z)
        toolhead.manual_move([None, None, target_z], self.z_move_speed)
        toolhead.wait_moves()

    def _run_probe_with_recovery(self, gcmd):
        toolhead = self.printer.lookup_object('toolhead')
        last_err = None

        for _ in range(self.recover_max_attempts):
            try:
                return self.probe_multi_axis.run_probe(
                    "z-", gcmd, speed_ratio=0.5, max_distance=10.0, samples=1
                )[2]
            except Exception as e:
                last_err = e
                if "triggered prior to movement" not in str(e).lower():
                    raise
                toolhead.wait_moves()
                cur = toolhead.get_position()
                toolhead.manual_move(
                    [None, None, cur[2] + self.recover_lift_mm],
                    self.z_move_speed
                )
                toolhead.wait_moves()
                if self.recover_pause_ms:
                    self.gcode.run_script_from_command(f"G4 P{self.recover_pause_ms}")

        raise gcmd.error(f"Axiscope: Probe still triggered after recovery. {last_err}")

    # ===========================
    # FIX B: RELEASE AFTER EACH SAMPLE
    # ===========================
    def _probe_zswitch(self, gcmd):
        requested = gcmd.get_int('SAMPLES', self.samples, minval=1)
        max_count = gcmd.get_int('SAMPLES_MAX_COUNT', self.samples_max_count, minval=requested)
        tolerance = gcmd.get_float('SAMPLES_TOLERANCE', self.samples_tolerance, minval=0.)

        toolhead = self.printer.lookup_object('toolhead')
        samples = []

        for _ in range(max_count):
            z = self._run_probe_with_recovery(gcmd)
            samples.append(z)

            # IMPORTANT: always release the switch between samples
            toolhead.wait_moves()
            cur = toolhead.get_position()
            target_z = max(cur[2] + self.recover_lift_mm, self.safe_start_z)
            toolhead.manual_move([None, None, target_z], self.z_move_speed)
            toolhead.wait_moves()

            if len(samples) >= requested:
                spread = max(samples) - min(samples)
                if spread <= tolerance:
                    return sum(samples) / len(samples)

        spread = max(samples) - min(samples)
        raise gcmd.error(
            f"Probe spread {spread:.5f} exceeds tolerance {tolerance:.5f}"
        )

    def cmd_PROBE_ZSWITCH(self, gcmd):
        toolhead = self.printer.lookup_object('toolhead')
        tool_no = str(self.toolchanger.active_tool.tool_number)
        start_pos = toolhead.get_position()

        z = self._probe_zswitch(gcmd)
        t = self.printer.get_reactor().monotonic()

        if tool_no == "0":
            self.probe_results[tool_no] = {'z_trigger': z, 'z_offset': 0, 'last_run': t}
        elif "0" in self.probe_results:
            z_offset = z - self.probe_results["0"]['z_trigger']
            self.probe_results[tool_no] = {'z_trigger': z, 'z_offset': z_offset, 'last_run': t}

        toolhead.move(start_pos, self.z_move_speed)
        toolhead.set_position(start_pos)
        toolhead.wait_moves()

    def cmd_CALIBRATE_ALL_Z_OFFSETS(self, gcmd):
        if not self.is_homed():
            gcmd.respond_error("Must home first")
            return

        self.cmd_AXISCOPE_START_GCODE(gcmd)

        for tool in self.toolchanger.tool_numbers:
            self.cmd_AXISCOPE_BEFORE_PICKUP_GCODE(gcmd)
            self.gcode.run_script_from_command(f"T{tool}")
            self.cmd_AXISCOPE_AFTER_PICKUP_GCODE(gcmd)

            self.gcode.run_script_from_command("MOVE_TO_ZSWITCH")
            self.gcode.run_script_from_command(
                f"PROBE_ZSWITCH SAMPLES={self.samples} "
                f"SAMPLES_TOLERANCE={self.samples_tolerance} "
                f"SAMPLES_MAX_COUNT={self.samples_max_count}"
            )

        self.cmd_AXISCOPE_FINISH_GCODE(gcmd)

    def cmd_AXISCOPE_START_GCODE(self, gcmd):
        if self.start_gcode:
            self.start_gcode.run_gcode_from_command({})

    def cmd_AXISCOPE_BEFORE_PICKUP_GCODE(self, gcmd):
        if self.before_pickup_gcode:
            self.before_pickup_gcode.run_gcode_from_command({})

    def cmd_AXISCOPE_AFTER_PICKUP_GCODE(self, gcmd):
        if self.after_pickup_gcode:
            self.after_pickup_gcode.run_gcode_from_command({})

    def cmd_AXISCOPE_FINISH_GCODE(self, gcmd):
        if self.finish_gcode:
            self.finish_gcode.run_gcode_from_command({})

def load_config(config):
    return Axiscope(config)
