var chai = require('chai')
var chalk = require('chalk')
var log = require('npmlog')
var sauceConnectLauncher = require('sauce-connect-launcher')
var webdriverio = require('webdriverio')

var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()
var request = require('request').defaults({json: true})

var config = require('./lib/config')
log.level = config.log.level

var tmp = config.client.split(':')
var runner = tmp[0] || 'selenium'
var browser = {
  name: tmp[1] || 'chrome',
  browserName: tmp[1] || 'chrome',
  version: tmp[2] || null, // Latest
  platform: tmp[3] || null
}

var options = {
  baseUrl: 'http://' + config.server.host + ':' + config.server.port,
  logLevel: config.log.level,
  desiredCapabilities: browser
}

log.silly('runner', 'runner is %s', runner)
log.silly('options', 'set options.baseUrl to %s', options.baseUrl)

if (runner === 'saucelabs') {
  options.user = config.saucelabs.username
  options.key = config.saucelabs.accessKey

  log.silly('options', 'set options.user to %s', options.user)
  log.silly('options', 'set options.key to ***')

  // http://webdriver.io/guide/testrunner/cloudservices.html#With_Travis_CI
  options.desiredCapabilities['tunnel-identifier'] = config.tunnelId
  options.desiredCapabilities.build = config.saucelabs.desiredCapabilities.build

  options.desiredCapabilities['idle-timeout'] = config.saucelabs.desiredCapabilities['idle-timeout']
  options.desiredCapabilities['max-duration'] = config.saucelabs.desiredCapabilities['max-duration']
  options.desiredCapabilities['command-timeout'] = config.saucelabs.desiredCapabilities['command-timeout']
}

if (process.env.TRAVIS_JOB_NUMBER) {
  options.desiredCapabilities.name += ' - ' + process.env.TRAVIS_JOB_NUMBER
}

log.silly('options', 'set options.desiredCapabilities to %j', options.desiredCapabilities)

var client = webdriverio.remote(options)
chaiAsPromised.transferPromiseness = client.transferPromiseness

/* global before */
before(function (done) {
  var self = this

  this.timeout(config.timeout)
  this.client = client

  var retries = 0
  var started = function () {
    if (++retries > 60) {
      done('Unable to connect to selenium')
      return
    }

    if (runner === 'selenium') {
      startSelenium(startTest)
    } else {
      startSauceConnect(startTest)
    }

    function startSelenium (callback) {
      log.verbose('selenium', 'starting ...')
      request(config.selenium.hub, function (error, resp) {
        if (error) throw error

        if (resp && resp.statusCode === 200) {
          log.info('selenium', 'started')
          callback()
        } else {
          log.verbose('selenium', 'not yet ready ...')
          setTimeout(started, 1000)
        }
      })
    }

    function startSauceConnect (callback) {
      log.verbose('sauce-connect', 'starting ...')
      var scOptions = {
        username: options.user,
        accessKey: options.key,
        tunnelIdentifier: config.tunnelId
      }

      sauceConnectLauncher(scOptions, function (error, process) {
        if (error) {
          log.error('sauce-connect', 'Failed to connect')
          log.error('sauce-connect', error)
          return process.exit(1)
        }
        callback()
      })
    }

    function startTest () {
      self.client.on('command', function (command) {
        log.info('selenium', chalk.cyan(command.method), command.uri.path)
        log.info('selenium', command.data)
      })
      self.client.on('erorr', function (error) {
        log.error('selenium', chalk.red(error.body.value.class), error.body.value.message)
      })
      self.client.init(done)
    }
  }

  started()
})

/* global after */
after(function (done) {
  this.client.end(done)
})
