var chai = require('chai')
var chalk = require('chalk')
var log = require('npmlog')
var sauceConnectLauncher = require('sauce-connect-launcher')
var webdriverio = require('webdriverio')

var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()
var request = require('request')

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

  var seleniumRetries = 0
  var saucelabsRetries = 0
  var started = function () {
    if (++seleniumRetries > 60) {
      done(new Error('Unable to connect to selenium'))
      return
    }

    if (runner === 'selenium') {
      startSelenium(assureServer)
    } else {
      startSauceConnect(assureServer)
    }

    function startSelenium (callback) {
      log.verbose('test', 'wating for selenium at ' + config.selenium.hub + '...')
      request(config.selenium.hub, function (_error, response) {
        if (response && response.statusCode === 200) {
          log.info('selenium', 'started')
          return callback()
        }

        log.verbose('selenium', 'not yet ready ...')
        setTimeout(started, 1000)
      })
    }

    function startSauceConnect (callback) {
      log.verbose('sauce-connect', 'starting ...')
      var scOptions = {
        username: options.user,
        accessKey: options.key,
        tunnelIdentifier: config.tunnelId
      }

      sauceConnectLauncher(scOptions, function (error) {
        if (!error) {
          return callback()
        }

        if (/Not authorized/i.test(error.message)) {
          log.error('sauce-connect', error)
          return process.exit(1)
        }

        if (++saucelabsRetries > 10) {
          log.error('sauce-connect', 'Failed to connect in 10 attempts')
          log.error('sauce-connect', error)
          return process.exit(1)
        }

        log.warn('sauce-connect', 'Failed to connect')
        log.warn('sauce-connect', error)
        log.warn('sauce-connect', 'Retry ' + saucelabsRetries + '/10 in 1 minute')

        setTimeout(startSauceConnect.bind(null, callback), 60 * 1000)
      })
    }

    function assureServer () {
      var url = 'http://' + config.server.host + ':' + config.server.port
      log.verbose('test', 'waiting for server at ' + url + ' ...')
      request({
        url: url,
        headers: {
          Accept: 'text/html'
        }
      }, function (error, response, body) {
        if (response && response.statusCode === 200) {
          log.info('test', 'server found')
          return startTest()
        }

        if (error) {
          log.verbose('test', error)
        } else {
          log.warn('test', 'server returns ' + response.statusCode + ' but tests expect 200')
          log.verbose('test', body)
        }

        log.verbose('test', 'not yet ready, checking again ...')
        setTimeout(assureServer, 1000)
      })
    }

    function startTest () {
      self.client.on('command', function (command) {
        log.info('selenium', chalk.cyan(command.method), command.uri.path)

        if (command.data.script) {
          command.data.script = getScriptName(command.data.script)
        }
        log.info('selenium', command.data)
      })
      self.client.on('erorr', function (error) {
        log.error('selenium', chalk.red(error.body.value.class), error.body.value.message)
      })

      self.client
        .init()

        // http://webdriver.io/api/protocol/timeouts.html
        .timeouts('script', config.timeout)
        .timeouts('implicit', config.timeout)
        .timeouts('page load', config.timeout)

        .then(function () {
          done()
        })
    }

    function getScriptName (script) {
      var matches = script.match(/return \(function (\w+)/)
      return matches ? matches[1] : '[function]'
    }
  }

  started()
})

/* global after */
after(function (done) {
  this.client.end(done)
})
