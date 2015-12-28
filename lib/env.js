module.exports = {
  client: process.env.CLIENT,
  timeout: process.env.TIMEOUT,
  log: {
    level: process.env.LOG_LEVEL
  },
  server: {
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT,
    cmd: process.env.SERVER_CMD
  },
  selenium: {
    hub: process.env.SELENIUM_HUB
  },
  saucelabs: {
    username: process.env.SAUCELABS_USERNAME,
    accessKey: process.env.SAUCELABS_ACCESS_KEY,
    desiredCapabilities: {
      build: process.env.TRAVIS_BUILD_NUMBER,
      'idle-timeout': process.env.SAUCELABS_IDLE_TIMEOUT,
      'max-duration': process.env.SAUCELABS_MAX_DURATION,
      'command-timeout': process.env.SAUCELABS_COMMAND_TIMEOUT
    }
  },
  tunnelId: process.env.TRAVIS_JOB_NUMBER
}
