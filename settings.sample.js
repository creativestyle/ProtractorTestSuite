'use strict';

var settings = {
  // configure seleniumAddress and run `selenium start` before starting tests
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // or seleniumServerJar and chromeDriver
  seleniumServerJar: '/usr/lib64/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
  chromeDriver: '/usr/lib64/node_modules/protractor/selenium/chromedriver',

  baseUrl: 'http://url.to.website.lo',
  enabled: ['localChrome', 'localPhantomjs', 'localFirefox'],
  concurrent: 0,
  concurrentPerBrowser: 2,
  failsScreenshotDir: '/tmp/mediasaturn-fails/'
};

module.exports = settings;
