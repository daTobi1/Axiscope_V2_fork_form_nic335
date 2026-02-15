# Dateianalyse: Axiscope

## Überblick
Axiscope besteht aus drei klar getrennten Teilen:

1. **Web-Frontend** (`index.html`, `js/*`, `css/*`) für Bedienung, Kamerabild und Offset-Berechnung.
2. **Mini-Webserver** (`app.py`) zum Ausliefern statischer Dateien auf Port 3000.
3. **Klipper-Erweiterung** (`klippy/extras/axiscope.py`) für Z-Switch-Probing, Makro-Ausführung und Schreiben von Tool-Offsets in Konfigurationsdateien.

Dazu kommen Install-/Uninstall-Skripte für Service-Setup auf einem Klipper/Moonraker-Host (`install.sh`, `uninstall.sh`).

---

## Architektur und Datenfluss

- Das Frontend spricht direkt mit Moonraker-Endpunkten (`/printer/objects/query`, `/printer/gcode/script`) über eine konfigurierbare Drucker-IP.
- Positionen und Toolstatus werden zyklisch aktualisiert (`setInterval(updatePage, 1000)`).
- XY-Offsets werden clientseitig aus erfasster T0-Referenz und aktiver Tool-Position berechnet (`updateOffset` in `js/tools.js`).
- Z-Offsets werden über das Klipper-Modul gemessen (`CALIBRATE_ALL_Z_OFFSETS`, `PROBE_ZSWITCH`) und dann im UI angezeigt.
- Persistenz der Offsets erfolgt optional über `config_file_path` im Klipper-Modul.

---

## Stärken

- **Klare Funktionsaufteilung** zwischen UI, API-Aufrufen und Firmware-nahem Klipper-Code.
- **Praxisnahe Bedienung**: Kamerawahl, Flip/Zoom/Contrast, schnelle Bewegungsbuttons, Toolwechsel-Helfer.
- **Makro-Integration** im Klipper-Modul (`start_gcode`, `before_pickup_gcode`, `after_pickup_gcode`, `finish_gcode`) erlaubt flexible Workflows je Drucker.
- **Installationsautomatisierung** via `install.sh` inkl. systemd-Service + Moonraker-Update-Manager-Eintrag.

---

## Auffälligkeiten / Risiken

1. **Möglicher Bug beim Speichern mehrerer Tools**  
   In `cmd_AXISCOPE_SAVE_MULTIPLE_TOOL_OFFSETS` wird `TOOLS` nicht per `ast.literal_eval` geparst, obwohl darüber iteriert wird. Dadurch droht Iteration über Zeichen statt Toolnamen, wenn `TOOLS` als String kommt.

2. **Intervall-Leak im Frontend**  
   `startProbeResultsUpdates()` erzeugt per `setInterval` alle 2s einen Polling-Loop, ohne Handle zu speichern oder beim Disconnect zu stoppen. Bei erneutem Verbinden können mehrere Loops parallel laufen.

3. **Doppelte IDs in dynamisch erzeugtem HTML**  
   Tool-Buttons nutzen wiederholt `id="toolchange"`, ebenso Capture-Elemente. Das ist HTML-seitig ungültig und kann zu unerwartetem Selektor-Verhalten führen.

4. **Sicherheits-/Robustheitsaspekt bei URL-Aufbau**  
   `printerUrl()` erzwingt immer `http://` und validiert Hostnamen/IP recht großzügig. Es gibt keine Authentifizierungstoken-Verwaltung; in geschützten Setups kann das fehlschlagen.

5. **Installationsskript: potenzielle Kollisionen**  
   Symlink-Anlage zu `~/klipper/klippy/extras/axiscope.py` nutzt hartkodierte Pfade und `ln -s` ohne vorherige Bereinigung. Bei bestehendem Ziel kann der Schritt scheitern.

---

## Kurzfazit

Das Projekt ist funktional sinnvoll aufgebaut und für den Ziel-Use-Case (Tool-Alignment mit Kamera + Klipper Toolchanger) bereits gut nutzbar. Die größten technischen Hebel für Stabilität sind:

- Fix für Multi-Tool-Offset-Speichern,
- sauberes Lifecycle-Management der Polling-Intervalle,
- Umstellung von mehrfachen IDs auf Klassen/
  eindeutige IDs.

Wenn gewünscht, kann ich diese drei Punkte im nächsten Schritt direkt als Patch umsetzen.
