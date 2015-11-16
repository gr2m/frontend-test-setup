module.exports = {
  client: 'selenium:chrome',
  timeout: 180000,
  tunnelId: 'tunnel-' + Date.now(),
  log: {
    level: 'error'
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    cwd: '.',
    browserify: {}
  },
  selenium: {
    hub: 'http://localhost:4444/wd/hub/status'
  },
  saucelabs: {
    desiredCapabilities: {
      'idle-timeout': 600,
      'max-duration': 60 * 45,
      'command-timeout': 600
    }
  }
}
