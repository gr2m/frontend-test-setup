#!/usr/bin/env node

var LOG_LEVEL = process.env.LOG_LEVEL || 'error'

var exec = require('child_process').exec
var http = require('http')

var beefy = require('beefy')
var log = require('npmlog')

var config = require('../lib/config')
log.level = LOG_LEVEL

if (config.server.cmd) {
  startCustomServer(config.server.cmd)
} else {
  startBeefy(config.server)
}

function startCustomServer (command) {
  log.info('frontend-test-server', 'Starting custom server')
  log.silly('frontend-test-server', command)
  exec(command, function (error, out, err) {
    if (error) {
      return log.error('frontend-test-server', error)
    }
    log.info('frontend-test-server', 'app started')
  })
}

function startBeefy (serverConfig) {
  log.info('frontend-test-server', 'Starting custom server with:')
  log.silly('frontend-test-server', serverConfig)

  var server = http.createServer(beefy({
    cwd: serverConfig.cwd,
    entries: serverConfig.browserify
  }))

  server.listen(serverConfig.port, serverConfig.host, function () {
    console.log('Server startet at http://%s:%s', serverConfig.host, serverConfig.port)
    log.info('frontend-test-server', 'serving static files from %s', serverConfig.cwd)
    Object.keys(serverConfig.browserify).forEach(function (key) {
      log.info('frontend-test-server', 'serving browserified %s at %s', serverConfig.browserify[key], key)
    })
  })

  server.on('request', function (request, response) {
    log.info('frontend-test-server', '%s %s', request.method, request.url, response.statusCode)
  })
}
