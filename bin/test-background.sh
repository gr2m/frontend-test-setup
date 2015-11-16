#!/bin/bash

set -e

function cleanup {
  set +e

  node_modules/.bin/frontend-test-kill-selenium

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
  node_modules/.bin/install_selenium
  node_modules/.bin/install_chromedriver
fi

# show logs in Travis, pipe to log files locally
if [ $CI ] ; then
  # Travis does not support Chrome, so we only start Selenium
  node_modules/.bin/start_selenium &
  node_modules/.bin/frontend-test-server &
else
  mkdir -p log
  node_modules/.bin/start_selenium_with_chromedriver &>./log/selenium.log &
  node_modules/.bin/frontend-test-server &>./log/server.log &
fi

# run test command
eval $@
