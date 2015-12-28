var path = require('path')

var defaultsDeep = require('lodash.defaultsdeep')

var defaults = require('./defaults')
var env = require('./env')

var pkg = require(path.resolve(process.cwd(), 'package.json'))
var config = pkg['frontend-test-setup'] || {}

if (!config.server.cmd) {
  config.server.cwd = path.resolve(process.cwd(), config.server.cwd)
  Object.keys(config.server.browserify).forEach(function (key) {
    config.server.browserify[key] = path.resolve(process.cwd(), config.server.browserify[key])
  })
}

module.exports = defaultsDeep(env, config, defaults)
