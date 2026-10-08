# Scanner Service

Small Node.js service and host scripts that drive a physical document scanner, a Canon
DR-C230 through NAPS2 on Windows and `scanimage` on Linux. It is one of six parts that
belong together, see also `home-setup`, `home-api`, `home-dashboard`, `reverse-proxy`
and `home-backup`.

The service exposes a tiny HTTP API. The `home-api` repository calls it when a user
presses a scan button in the dashboard or on the Dashy start page.

## How it works

```
home-dashboard (Dashy button)
        │  HTTP
        ▼
home-api  ── POST http://host.docker.internal:4356/trigger/scanfile ──▶  this service
                                                                          │
                                                        cmd.exe /c scripts\scanWin.bat <category>
                                                                          │
                                                                     NAPS2.Console
                                                                          │
                                                        <SCAN_DIR>\<category>\<timestamp>.pdf
```

The category (`user1`, `user2`, ...) becomes the sub folder below `SCAN_DIR`. That folder
is mounted into Paperless as the consume folder, so a finished scan lands in the document
archive on its own.

## Contents

| Path | Purpose |
|---|---|
| `service/index.js` | Express server on port `4356` with `POST /trigger/:operation` and `GET /alive` |
| `service/operations/scanfile.js` | Runs `scripts/scanWin.bat` with the category from the request body |
| `service/operations/killprocess.js` | Runs `scripts/killProcess.bat` to kill a process by name, used to stop NAPS2 |
| `service/scripts/scanWin.bat` | Scans one document with NAPS2 and returns JSON with the created file |
| `service/scripts/killProcess.bat` | Kills all processes that match a name and returns the killed PIDs |
| `service/installWindowsService.js` and `service/uninstallWindowsService.js` | Register and remove the service with [node-windows](https://github.com/coreybutler/node-windows) |
| `service/testProcess.js` | Runs a single operation from the command line, without the HTTP server |
| `service/installNodeWindows.bat` | Installs `node-windows` globally and links it into the service folder |
| `scripts/scanWin.bat` | Standalone Windows scan script, for use without the service |
| `scripts/scan.sh` | Linux equivalent that uses `scanimage` and ImageMagick `convert` |
| `naps2/profiles.xml` | Example NAPS2 profile. Copy it into the NAPS2 install directory so the CLI has a default profile. |

## Output folder

All scripts write to `SCAN_DIR`. When the variable is not set they fall back to
`C:\SCANS` on Windows or `$HOME/Documents/Scans` on Linux. Set it as a system wide
environment variable for the account that runs the service.

## Install as a Windows service

```bat
cd service
npm install
npm install -g node-windows
npm link node-windows
node installWindowsService.js
```

The service is registered with the name *Home Setup Windows Service* and runs
`service/index.js`. To remove it again:

```bat
node uninstallWindowsService.js
```

## Test without the service

```bat
cd service
node testProcess.js scanfile "{\"category\":\"user1\"}"
node testProcess.js killprocess "{\"processName\":\"NAPS2.Console\"}"
```

## NAPS2 notes

- `NAPS2.Console` is often not in the `PATH`. Add the NAPS2 install directory to it or
  call the executable with its full path in the batch file.
- When NAPS2 is started by a service it does not load any profile. Copy
  `naps2/profiles.xml` into the NAPS2 install directory as `profiles.xml` so a default
  profile named `Canon DR-C230` exists.

## How the callers find this service

`home-api` expects the service on the docker host at port `4356`, see
`app/src/documents/scanning.service.ts` in that repository. `GET /alive` on the same port
can be used as a health check.

## License

Private project, no license granted.
