var Service = require('node-windows').Service;
var path = require('path');

// Create a new service object. The script path is resolved relative to this file
// so the repository can live anywhere on the host.
var svc = new Service({
  name: 'Home Setup Windows Service',
  description: 'The link to the hardware running on the host',
  script: path.join(__dirname, 'index.js'),
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function () {
  console.log('Uninstall complete.');
  console.log('The service exists: ', svc.exists);
});

// Uninstall the service.
svc.uninstall();