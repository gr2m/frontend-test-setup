#!/bin/bash

set -e

# find bin paths. They are different for npm 2 / 3
KILL_SELENIUM_PATH=`(cd node_modules/\\@gr2m/frontend-test-setup && node -e "process.stdout.write(require('path').resolve(require.resolve('sv-selenium/package.json'), '../bin/kill_selenium'))")`
INSTALL_SELENIUM_PATH=`(cd node_modules/\\@gr2m/frontend-test-setup && node -e "process.stdout.write(require('path').resolve(require.resolve('sv-selenium/package.json'), '../bin/install_selenium'))")`
INSTALL_CHROMEDRIVER_PATH=`(cd node_modules/\\@gr2m/frontend-test-setup && node -e "process.stdout.write(require('path').resolve(require.resolve('sv-selenium/package.json'), '../bin/install_chromedriver'))")`
START_SELENIUM_PATH=`(cd node_modules/\\@gr2m/frontend-test-setup && node -e "process.stdout.write(require('path').resolve(require.resolve('sv-selenium/package.json'), '../bin/start_selenium'))")`
START_SELENIUM_WITH_CHROMEDRIVER_PATH=`(cd node_modules/\\@gr2m/frontend-test-setup && node -e "process.stdout.write(require('path').resolve(require.resolve('sv-selenium/package.json'), '../bin/start_selenium_with_chromedriver'))")`

function cleanup {
  set +e

  sh $KILL_SELENIUM_PATH

  # kill chrome driver
  CHROMEDRIVER_PID=`ps -ef | grep chromedriver | grep -v grep | awk '{print $2}'`
  if [ "$CHROMEDRIVER_PID" ] ; then
    kill -9 $CHROMEDRIVER_PID
    echo "Killed chromedriver ($CHROMEDRIVER_PID)"
  fi

  # kill static server
  SERVER_PID=`ps -ef | grep 'frontend-test-server' | grep -v grep | awk '{print $2}'`
  if [ "$SERVER_PID" ] ; then
    kill -9 $SERVER_PID
    echo "Killed beefy ($SERVER_PID)"
  fi
}

# always kill selenium, no matter if tests pass or exit
trap cleanup EXIT

if [ ! -d "/tmp/sv-selenium" ]; then
  echo 'Selenium not yet installed, downloading & installing ...'
  sh $INSTALL_SELENIUM_PATH
  if [ ! $CI ] ; then
    sh $INSTALL_CHROMEDRIVER_PATH
  fi
fi

# show logs in Travis, pipe to log files locally
if [ $CI ] ; then
  echo 'CI detected, logging to stdout'
  # Travis does not support Chrome, so we only start Selenium
  sh $START_SELENIUM_PATH &
  node_modules/.bin/frontend-test-server &
else
  mkdir -p log
  echo 'logging to ./log/{server,selenium}.log'
  sh $START_SELENIUM_WITH_CHROMEDRIVER_PATH &>./log/selenium.log &
  node_modules/.bin/frontend-test-server &>./log/server.log &
fi

# run test command
eval $@
