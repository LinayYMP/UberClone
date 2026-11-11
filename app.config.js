// AI-assisted: see docs/AI_LOG.md #11
// Extiende app.json: si existe google-services.json (Firebase > Configuración del proyecto > app
// Android), la build de desarrollo lo incluye para recibir notificaciones con Firebase Cloud Messaging.
const fs = require('node:fs');

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    ...(fs.existsSync('./google-services.json') ? { googleServicesFile: './google-services.json' } : {}),
  },
});
