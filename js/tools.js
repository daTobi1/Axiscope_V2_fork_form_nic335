
const zeroListItem = ({tool_number, disabled, tc_disabled}) => `
<li class="list-group-item bg-body-tertiary p-2">
  <div class="container">
    <div class="row">
      <div class="col-2">
        <button 
          type="button"
          class="btn btn-secondary btn-sm w-100 h-100 ${tc_disabled}"
          id="toolchange"
          name="T${tool_number}"
          data-tool="${tool_number}"
        >
          <h1>T${tool_number}</h1>
        </button>
      </div>

      <div class="col-6" >
        <button 
          type="button" 
          class="btn btn-sm btn-secondary fs-6 border text-center h-100 w-100 ps-5 pe-5 ${disabled}" 
          style="padding-bottom:5px; padding-top:5px;" 
          id="capture-pos"
          >
            CAPTURE <br/> CURRENT <br/> POSITION
          </button>
      </div>

      <div class="col-4 border rounded bg-dark">
        <div class="row">
          <span class="fs-6 lh-sm pt-1 pb-1"><small>Captured Position</small></span>
          <div class="row justify-content-center">
            <div class="col-1 ms-4">
              <span class="fs-5 lh-sm"><small>X:</small></span>
            </div>
            <div class="col-6">
              <span class="fs-5 lh-sm" id="captured-x" data-axis="x"><small></small></span>
            </div>
          </div>
          <div class="row justify-content-center">
            <div class="col-1 ms-4">
              <span class="fs-5 lh-sm"><small>Y:</small></span>
            </div>
            <div class="col-6">
              <span class="fs-5 lh-sm" id="captured-y" data-axis="y"><small></small></span>
            </div>
          </div>
          <div class="row justify-content-center">
            <div class="col-1 ms-4">
              <span class="fs-5 lh-sm"><small>Z:</small></span>
            </div>
            <div class="col-6">
              <span class="fs-5 lh-sm" id="captured-z" data-axis="z"><small></small></span>
            </div>
          </div>
          <div class="row justify-content-center">
            <div class="col-4">
              <span class="fs-6 lh-sm"><small>Z-Trigger:</small></span>
            </div>
            <div class="col-6">
              <span class="fs-5 lh-sm" id="T${tool_number}-z-trigger"><small>-</small></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</li>
`;

const nonZeroListItem = ({tool_number, cx_offset, cy_offset, disabled, tc_disabled}) => `
<li class="list-group-item bg-body-tertiary p-2">
  <div class="container">
    <div class="row">
      <div class="col-2">
        <button 
          type="button"
          class="btn btn-secondary btn-sm w-100 h-100 ${tc_disabled}"
          id="toolchange"
          name="T${tool_number}"
          data-tool="${tool_number}"
        >
          <h1>T${tool_number}</h1>
        </button>
      </div>

      <div class="col-6">
        <div class="row pb-4">
            <div class="input-group ps-1 pe-1">
              <button 
                class="btn btn-secondary ${disabled}" 
                type="button" 
                id="T${tool_number}-fetch-x" 
                data-axis="x" 
                data-tool="${tool_number}" 
              >X</button>
              <input 
                type="number" 
                name="T${tool_number}-x-pos"
                class="form-control" 
                placeholder="0.0" 
                aria-label="Grab Current X Position" 
                aria-describedby="x-axis" 
                data-axis="x" 
                data-tool="${tool_number}" 
                ${disabled}
              >
            </div>
        </div>

        <div class="row">
            <div class="input-group ps-1 pe-1">
              <button 
                class="btn btn-secondary ${disabled}" 
                type="button" 
                id="T${tool_number}-fetch-y" 
                data-axis="y" 
                data-tool="${tool_number}" 
              >Y</button>
              <input 
                type="number" 
                name="T${tool_number}-y-pos"
                class="form-control" 
                placeholder="0.0" 
                aria-label="Grab Current Y Position" 
                aria-describedby="y-axis" 
                data-axis="y" 
                data-tool="${tool_number}" 
                ${disabled}
              >
            </div>
        </div>
      </div>

      <div class="col-4 border rounded bg-dark">
        <div class="row">
          <div class="col-6 pt-1 pb-1">
            <div class="row pb-1">
              <span class="fs-6 lh-sm text-secondary"><small>Current X</small></span>
              <span class="fs-5 lh-sm text-secondary" id="T${tool_number}-x-offset"><small>${cx_offset}</small></span>
            </div>
            <div class="row">
              <span class="fs-6 lh-sm text-secondary"><small>Current Y</small></span>
              <span class="fs-5 lh-sm text-secondary" id="T${tool_number}-y-offset"><small>${cy_offset}</small></span>
            </div>
            <div class="z-fields d-none">
              <div class="row">
                <span class="fs-6 lh-sm text-secondary"><small>Z-Trigger</small></span>
                <span class="fs-5 lh-sm text-secondary" id="T${tool_number}-z-trigger"><small>-</small></span>
              </div>
              <div class="row">
                <span class="fs-6 lh-sm text-secondary"><small>Z-Offset</small></span>
              </div>
            </div>
          </div>

          <div class="col-6 pt-2 pb-2 getGcodes" toolId="${tool_number}">
            <div class="row pb-1">
              <span class="fs-6 lh-sm"><small>New X</small></span>
              <span class="fs-5 lh-sm" id="T${tool_number}-x-new"><small>0.0</small></span>
            </div>
            <div class="row pb-1">
              <span class="fs-6 lh-sm"><small>New Y</small></span>
              <span class="fs-5 lh-sm" id="T${tool_number}-y-new"><small>0.0</small></span>
            </div>
            <div class="row pb-1">
              <span class="fs-6 lh-sm"><small>New Z</small></span>
              <span class="fs-5 lh-sm" id="T${tool_number}-z-new"><small>0.0</small></span>
            </div>
            <div class="row text-end">
              <button 
                class="btn btn-link btn-sm p-0" 
                id="T${tool_number}-copy-all" 
                title="Copy all offsets"
              >
              Copy
                <i class="bi bi-clipboard-data fs-5"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</li>
`;


function toolChangeURL(tool) {
  var x_pos = $("#captured-x").find(":first-child").text();
  var y_pos = $("#captured-y").find(":first-child").text();
  var z_pos = $("#captured-z").find(":first-child").text();

  // Convert to numbers and validate
  x_pos = parseFloat(x_pos);
  y_pos = parseFloat(y_pos);
  z_pos = parseFloat(z_pos);

  // Check if we have valid numbers for all positions
  if (isNaN(x_pos) || isNaN(y_pos) || isNaN(z_pos)) {
    // Even without positions, we still need the proper macro sequence
    var url = printerUrl(printerIp, "/printer/gcode/script?script=AXISCOPE_BEFORE_PICKUP_GCODE");
    url = url + "%0AT" + tool;
    url = url + "%0AAXISCOPE_AFTER_PICKUP_GCODE";
    return url;
  }

  // For T0, always use captured position without offsets
  if (tool !== "0") {
    // Get the position values directly from the inputs
    var tool_x = parseFloat($("input[name=T"+tool+"-x-pos]").val()) || 0.0;
    var tool_y = parseFloat($("input[name=T"+tool+"-y-pos]").val()) || 0.0;

    if (tool_x !== 0.0 && tool_y !== 0.0) {
      x_pos = tool_x;
      y_pos = tool_y;
    }
  }
  
  // Format positions to 3 decimal places
  x_pos = x_pos.toFixed(3);
  y_pos = y_pos.toFixed(3);
  z_pos = z_pos.toFixed(3);

  // Start with AXISCOPE_BEFORE_PICKUP_GCODE macro
  var url = printerUrl(printerIp, "/printer/gcode/script?script=AXISCOPE_BEFORE_PICKUP_GCODE");
  
  // Perform the tool change
  url = url + "%0AT" + tool;
  
  // Run AXISCOPE_AFTER_PICKUP_GCODE macro
  url = url + "%0AAXISCOPE_AFTER_PICKUP_GCODE";
  
  // Add the movement commands
  url = url + "%0ASAVE_GCODE_STATE NAME=RESTORE_POS";
  url = url + "%0AG90";
  url = url + "%0AG0 Z" + z_pos + " F3000";
  url = url + "%0AG0 X" + x_pos + " Y" + y_pos + " F12000";
  url = url + "%0ARESTORE_GCODE_STATE NAME=RESTORE_POS";

  return url;
}


function getProbeResults() {
  var url = printerUrl(printerIp, "/printer/objects/query?axiscope");
  return $.get(url).then(function(data) {
    const axiscopeStatus = data.result?.status?.axiscope;
    if (axiscopeStatus) {
      // Show Z rows whenever Axiscope object is available.
      $('.z-fields').removeClass('d-none');
      return axiscopeStatus.probe_results || {};
    }
    return {};
  }).catch(function(error) {
    console.error('Error fetching probe results:', error);
    return {};
  });
}

function getProbeResultForTool(probeResults, toolNumber) {
  const asString = String(toolNumber);
  const asNumber = Number(toolNumber);
  const asToolName = `T${asString}`;
  return probeResults?.[toolNumber]
    ?? probeResults?.[asString]
    ?? probeResults?.[asNumber]
    ?? probeResults?.[asToolName]
    ?? null;
}

function updateProbeResults(tool_number, probeResults) {
  const result = getProbeResultForTool(probeResults, tool_number);
  if (result && typeof result.z_trigger !== 'undefined') {
    // Update Z-Trigger for all tools
    $(`#T${tool_number}-z-trigger`).find('>:first-child').text(Number(result.z_trigger).toFixed(3));
    
    // Update Z-Offset only for non-zero tools
    if (tool_number !== '0' && tool_number !== 0 && typeof result.z_offset !== 'undefined') {
      $(`#T${tool_number}-z-new`).find('>:first-child').text(Number(result.z_offset).toFixed(3));
    }
  }
}

// Start periodic probe results updates
function startProbeResultsUpdates() {
  // Update immediately
  updateAllProbeResults();
  
  // Then update every 2 seconds
  setInterval(updateAllProbeResults, 2000);
}

// Function to update all probe results
function updateAllProbeResults() {
  getProbeResults().then(function(probeResults) {
    // Get all tool numbers from the page
    const toolButtons = document.querySelectorAll('button[id="toolchange"]');
    toolButtons.forEach(button => {
      const toolNumber = button.getAttribute('data-tool');
      if (toolNumber !== null) {
        updateProbeResults(toolNumber, probeResults);
      }
    });
  });
}

function calibrateButton(isEnabled = false) {
  const buttonClass = isEnabled ? 'btn-primary' : 'btn-secondary';
  const disabledAttr = isEnabled ? '' : 'disabled';
  return `
<li class="list-group-item bg-body-tertiary p-2">
  <div class="container">r">
 |  | 
314
 

    <div class="row">
      <div class="col-12" >
        <button 
          type="button" 
          class="btn btn-sm ${buttonClass} fs-6 border text-center h-100 w-100" 
          style="padding-top:15px;" 
          onclick="calibrateAllTools()"
          ${disabledAttr}
          id="calibrate-all-btn"
        >
          CALIBRATE ALL Z-OFFSETS
        </button>
      </div>
    </div>
  </div>
</li>
`;
}

function calibrateAllTools() {
  const url = printerUrl(printerIp, "/printer/gcode/script?script=CALIBRATE_ALL_Z_OFFSETS");
  $.get(url)
    .done(function() {
      console.log("Started Z-offset calibration");
    })
    .fail(function(error) {
      console.error("Failed to start calibration:", error);
    });
}

function getTools() {
  var url = printerUrl(printerIp, "/printer/objects/query?toolchanger")
  var tool_names;
  var tool_numbers;
  var active_tool;

  $.get(url, function(data){
    const tcStatus = data?.result?.status?.toolchanger || {};
    const rawToolNames = tcStatus.tool_names;
    const rawToolNumbers = tcStatus.tool_numbers;

    tool_names = Array.isArray(rawToolNames) ? rawToolNames : Object.values(rawToolNames || {});
    tool_numbers = Array.isArray(rawToolNumbers) ? rawToolNumbers : Object.values(rawToolNumbers || {});
    tool_numbers = tool_numbers.map(v => Number(v)).filter(v => Number.isFinite(v));
    active_tool = Number(tcStatus.tool_number);

    if (!tool_numbers.length) {
      console.error('Toolchanger returned no tool numbers:', tcStatus);
      $("#tool-list").html('');
      return;
    }

    if (tool_names.length !== tool_numbers.length) {
      // Build stable fallback names from tool numbers.
      tool_names = tool_numbers.map(t => `tool ${t}`);
    }

    // 1) Always render immediately from tool_numbers so UI never becomes empty.
    $("#tool-list").html('');
    $.each(tool_numbers, function(i) {
      const tool_number = Number(tool_numbers[i]);
      var disabled = "";
      var tc_disabled = "disabled";

      if (tool_number != active_tool) {
        disabled = "disabled";
        tc_disabled = "";
      }

      if (tool_number === 0) {
        $("#tool-list").append(zeroListItem({tool_number: tool_number, disabled: disabled, tc_disabled: tc_disabled}));
      } else {
        $("#tool-list").append(nonZeroListItem({tool_number: tool_number, cx_offset: '0.000', cy_offset: '0.000', disabled: disabled, tc_disabled: tc_disabled}));
      }
    });
    $("#tool-list").append(calibrateButton(true, tool_numbers));

    // 2) Best-effort detail fetch for current X/Y offsets.
    url = printerUrl(printerIp, "/printer/objects/query?")
    $.each(tool_names, function(i) {
      if (tool_names[i]) {
        url = url + tool_names[i] + "&";
      }
    });
    url = url.substring(0, url.length-1);

    if (url.endsWith('?')) {
      updateAllProbeResults();
      updateTools(tool_numbers, active_tool);
      startProbeResultsUpdates();
      return;
    }

    $.get(url, function(data){
      $.each(tool_numbers, function(i) {
        const tool_number = Number(tool_numbers[i]);
        const toolName = tool_names[i];
        const toolStatus = data?.result?.status?.[toolName] || {};
        const cx_offset = Number(toolStatus['gcode_x_offset'] ?? 0).toFixed(3);
        const cy_offset = Number(toolStatus['gcode_y_offset'] ?? 0).toFixed(3);
        $(`#T${tool_number}-x-offset`).find('>:first-child').text(cx_offset);
        $(`#T${tool_number}-y-offset`).find('>:first-child').text(cy_offset);
      });
    }).fail(function(error) {
      console.error('Error loading tool status:', error);
    });

      // Add calibration button after all tools
      getProbeResults().then(results => {
        const hasProbeResults = Object.keys(results).length > 0;
        $("#tool-list").append(calibrateButton(hasProbeResults));
      });
      
      // Check if axiscope is available
      $.get(printerUrl(printerIp, "/printer/objects/query?axiscope")).then(function(data) {
        const hasProbeResults = data.result?.status?.axiscope?.probe_results != null;
        if (hasProbeResults) {
          $('.z-fields').removeClass('d-none');
        }
      }).catch(function(error) {
        console.error('Error checking axiscope availability:', error);
      });

    // Set up copy handlers for all tools
    tool_numbers.forEach(tool => {
      $(`#T${tool}-copy-all`).off('click').on('click', function() {
        const $this = $(this);
        const originalText = $this.text();
        
        // Get X/Y offsets
        const xOffset = $(`#T${tool}-x-new`).find('>:first-child').text();
        const yOffset = $(`#T${tool}-y-new`).find('>:first-child').text();
        let gcodeCommands = [
          `gcode_x_offset: ${xOffset}`,
          `gcode_y_offset: ${yOffset}`
        ];
        
        // Check if axiscope is available before including Z offset
        $.get(printerUrl(printerIp, "/printer/objects/query?axiscope")).then(data => {
          const hasProbeResults = data.result?.status?.axiscope?.probe_results != null;
          if (hasProbeResults) {
            const zValue = $(`#T${tool}-z-new`).find('>:first-child').text();
            gcodeCommands.push(`gcode_z_offset: ${zValue}`);
          }
          
          // Create temporary textarea
          const textarea = document.createElement('textarea');
          textarea.value = gcodeCommands.join('\n');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          
          try {
            textarea.select();
            document.execCommand('copy');
            const $icon = $this.find('i');
            $icon.removeClass('bi-clipboard-data').addClass('bi-clipboard-check-fill text-success');
            setTimeout(() => {
              $icon.removeClass('bi-clipboard-check-fill text-success').addClass('bi-clipboard-data');
            }, 1000);
          } catch (err) {
            console.error('Failed to copy:', err);
          } finally {
            document.body.removeChild(textarea);
          }
        }).catch(error => {
          console.error('Error checking axiscope availability:', error);
        });
      });
    });

    updateTools(tool_numbers, active_tool);
    
    // Start periodic updates after initial tool load
    startProbeResultsUpdates();
  }).fail(function(error) {
    console.error('Error loading toolchanger status:', error);
  });
}


function updateTools(tool_numbers, tn){
  const $captureBtn = $("#capture-pos");
  if(tn !== 0) {
    $captureBtn.addClass("disabled").prop("disabled", true);
  } else {
    $captureBtn.removeClass("disabled").prop("disabled", false);
  }

  $.each(tool_numbers, function(tool_no) {
    updateOffset(tool_no, "x");
    updateOffset(tool_no, "y");
    if (tn == tool_no) {
      if (!$("button[name=T"+tool_no+"]").hasClass("disabled")) {
        $("button[name=T"+tool_no+"]").addClass("disabled");
        $("#T"+tool_no+"-fetch-x").removeClass("disabled");
        $("#T"+tool_no+"-fetch-y").removeClass("disabled");
        $("input[name=T"+tool_no+"-x-pos]").removeAttr("disabled");
        $("input[name=T"+tool_no+"-y-pos]").removeAttr("disabled");
      }
    } else if ($("button[name=T"+tool_no+"]").hasClass("disabled")) {
      $("button[name=T"+tool_no+"]").removeClass("disabled");
      $("#T"+tool_no+"-fetch-x").addClass("disabled");
      $("#T"+tool_no+"-fetch-y").addClass("disabled");
      $("input[name=T"+tool_no+"-x-pos]").attr("disabled", "disabled");
      $("input[name=T"+tool_no+"-y-pos]").attr("disabled", "disabled");
    }
  });
}


function updateOffset(tool, axis) {
    var position = parseFloat($("input[name=T"+tool+"-"+axis+"-pos]").val()) || 0.0;
    var captured_pos = $("#captured-"+axis).text();

    // Only calculate new offset if this axis position is set and we have a captured position
    if (position !== 0.0 && captured_pos !== "") {
        captured_pos = parseFloat(captured_pos);
        var old_offset = parseFloat($("#T"+tool+"-"+axis+"-offset").text());

        var new_offset = (captured_pos-old_offset) - position;
        
        // Modify new_offset for display
        if (new_offset < 0) {
            new_offset = Math.abs(new_offset);
        } else {
            new_offset = -new_offset;
        }

        var offset_delta;
        if(new_offset == old_offset){
            offset_delta = 0;
        }else{
            // For delta: if new is more negative than old, it's negative delta
            offset_delta = Math.abs(new_offset) > Math.abs(old_offset) ? 
                -(Math.abs(new_offset) - Math.abs(old_offset)) : 
                Math.abs(old_offset) - Math.abs(new_offset);
        }

        const newOffsetText = new_offset.toFixed(3);
        
        // Update display
        $(`#T${tool}-${axis}-new`).attr('delta', offset_delta);
        $(`#T${tool}-${axis}-new`).find('>:first-child').text(newOffsetText);
    } else {
        // Reset to 0.0 if position is not set or no captured position
        $(`#T${tool}-${axis}-new`).attr('delta', 0);
        $(`#T${tool}-${axis}-new`).find('>:first-child').text('0.0');
    }
}