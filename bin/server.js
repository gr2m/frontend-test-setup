#!/usr/bin/env node

var LOG_LEVEL = process.env.LOG_LEVEL || 'error'

var http = require('http')

var beefy = require('beefy')
var log = require('npmlog')

var config = require('../lib/config')
log.level = LOG_LEVEL

var server = http.createServer(beefy({
  cwd: config.server.cwd,
  entries: config.server.browserify
}))

server.listen(config.server.port, config.server.host, function () {
  console.log('Server startet at http://%s:%s', config.server.host, config.server.port)
  log.info('frontend-test-server', 'serving static files from %s', config.server.cwd)
  Object.keys(config.server.browserify).forEach(function (key) {
    log.info('frontend-test-server', 'serving browserified %s at %s', config.server.browserify[key], key)
  })
})

server.on('request', function (request, response) {
  log.info('frontend-test-server', '%s %s', request.method, request.url, response.statusCode)
})
