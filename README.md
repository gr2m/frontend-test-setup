# frontend-test-setup

> reusable test setup for mocha, chai, browserify, webdriver, saucelabs & travis

[![Build Status](https://travis-ci.org/gr2m/frontend-test-setup.svg?branch=master)](https://travis-ci.org/gr2m/frontend-test-setup)
[![Dependency Status](https://david-dm.org/gr2m/frontend-test-setup.svg)](https://david-dm.org/gr2m/frontend-test-setup)
[![devDependency Status](https://david-dm.org/gr2m/frontend-test-setup/dev-status.svg)](https://david-dm.org/gr2m/frontend-test-setup#info=devDependencies)

## Install

```
npm install --save @gr2m/frontend-test-setup
```

## Usage

Add a `"frontend-test-setup"` key to your package.json

```js
  "frontend-test-setup": {
    "server": {
      // path to static files
      "cwd": "demo",
      // browserify: path: module
      "entries": {
        "/bundle.js": "demo/vendor.js",
        "/smartdate-input.js": "index.js"
      }
    }
    // see more options below
  }
```

Set your scripts to

```js
  "scripts": {
    "start": "frontend-test-server",
    "test": "frontend-test-background mocha test/*.js",
  }
```

Replace `mocha test/*.js` in `"test"` with whatever your mocha test command.

You must require `'@gr2m/frontend-test-setup'` in your tests

```js
require('@gr2m/frontend-test-setup')

describe('my demo page', function () {
  this.timeout(90000)

  it('loads successfully', function () {
    return this.client
      .url('/')
      .getTitle().should.eventually.equal("foo")
  })
})
```

`frontend-test-setup` plays nicely with [Travis](http://travis-ci.org/). If
you want to test using selenium, make sure to only test in Firefox as it's the
only supported browser, and add the following lines:

```
before_install:
  - export DISPLAY=:99.0
  - sh -e /etc/init.d/xvfb start
```

Set `SAUCELABS_USERNAME` & `SAUCELABS_ACCESS_KEY` as env variables, and test
as many different browser configurations using the `env.matrix` setting, e.g.

```
env:
  matrix:
  - TEST_CLIENT=selenium:firefox
  - TEST_CLIENT=saucelabs:chrome
  - TEST_CLIENT="saucelabs:internet explorer:10:Windows 8"
  - TEST_CLIENT="saucelabs:iphone:8.4:OS X 10.11"
```

## Options

`frontend-test-setup` can be configured in your `package.json`, simply
add a `"frontend-test-setup"` with the options below. Options with a `.`
delimiter are nested, e.g. `log.level` means log: {level: '...'}.

All settings in package.json can be overwritten using ENV variables, listed
below the option name.

<table>
  <thead>
    <tr>
      <th>Setting (ENV)</th>
      <th>Default / Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>client</strong><br>
        (<code>CLIENT</code>)<br><br>

        (saucelabs|selenium):browserName:browserVerion:platform,
        e.g. 'saucelabs:internet explorer:10:win10'
      </td>
      <td><code>'selenium:chrome'</code></td>
    </tr>
    <tr>
      <td>
        <strong>timeout</strong><br>
        (<code>TIMEOUT</code>)<br><br>

        mocha test timeout in milli seconds
      </td>
      <td><code>180000</code></td>
    </tr>
    <tr>
      <td>
        <strong>log.level</strong><br>
        (<code>LOG_LEVEL</code>)<br><br>

        one of the following: <code>error</code>, <code>warn</code>,
        <code>info</code>, <code>verbose</code>, <code>silly</code>
      </td>
      <td><code>'error'</code></td>
    </tr>
    <tr>
      <td>
        <strong>server.host</strong><br>
        (<code>SERVER_HOST</code>)<br><br>

        hostname for test server
      </td>
      <td><code>'0.0.0.0'</code></td>
    </tr>
    <tr>
      <td>
        <strong>server.port</strong><br>
        (<code>SERVER_HOST</code>)<br><br>

        port number for test server
      </td>
      <td><code>8080</code></td>
    </tr>
    <tr>
      <td>
        <strong>server.cwd</strong><br><br>

        path from where to server static assets
      </td>
      <td><code>'.'</code></td>
    </tr>
    </tr>
    <tr>
      <td>
        <strong>server.browserify</strong><br><br>

        Map of assets to be browserified. The example below will browserify
        `index.js` and at `http://<server.host>:<server.port>/my-lib.js`

<pre>
"entries": {
  "/my-lib.js": "index.js"
}
</pre>
      </td>
      <td><code>{}</code></td>
    </tr>
    <tr>
      <td>
        <strong>selenium.hub</strong><br>
        (<code>SELENIUM_HUB</code>)<br><br>

        Url to selenium hub
      </td>
      <td><code>'http://localhost:4444/wd/hub/status'</code></td>
    </tr>
    <tr>
      <td>
        <strong>saucelabs.username</strong><br>
        (<code>SAUCELABS_USERNAME</code>)<br><br>

        Saucelabs username for authentication
      </td>
      <td>e.g. <code>'pat'</code></td>
    </tr>
    <tr>
      <td>
        <strong>saucelabs.accessKey</strong><br>
        (<code>SAUCELABS_ACCESS_KEY</code>)<br><br>

        Saucelabs access key for authentication
      </td>
      <td>e.g. <code>'abcd5678-1234-1234-1234-abcd5678abcd'</code></td>
    </tr>
    <tr>
      <td>
        <strong>saucelabs.desiredCapabilities.idle-timeout</strong><br>
        (<code>SAUCELABS_IDLE_TIMEOUT</code>)<br><br>

        <a href="https://docs.saucelabs.com/reference/test-configuration/#idle-test-timeout">SauceLabs Idle Test Timeout</a>
      </td>
      <td><code>90</code>, allowed maximum is <code>1000</code></td>
    </tr>
    <tr>
      <td>
        <strong>saucelabs.desiredCapabilities.max-duration</strong><br>
        (<code>SAUCELABS_MAX_DURATION</code>)<br><br>

        <a href="https://docs.saucelabs.com/reference/test-configuration/#maximum-test-duration">SauceLabs Maximum Test Duration</a>
      </td>
      <td><code>1800</code>, allowed maximum is <code>10800</code></td>
    </tr>
    <tr>
      <td>
        <strong>saucelabs.desiredCapabilities.max-duration</strong><br>
        (<code>SAUCELABS_COMMAND_TIMEOUT</code>)<br><br>

        <a href="https://docs.saucelabs.com/reference/test-configuration/#command-timeout">SauceLabs Command Timeout</a>
      </td>
      <td><code>300</code>, allowed maximum is <code>600</code></td>
    </tr>
  </tbody>
</table>

## License

MIT
