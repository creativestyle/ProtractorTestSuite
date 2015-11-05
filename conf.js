'use strict';

var testsDir = process.env.TEST_DIR;
var dirname = __dirname;

try {
  var settings = require(testsDir + '/settings');
}catch (e) {
  console.error('You have to configure your test environment');
  console.error('Copy ' + __dirname + '/settings.sample.js to ' + testsDir + '/settings.js');
  console.error('And make necessary changes');
  process.exit(e.code);
}

var caps = [];

settings.enabled.forEach(function (conf) {
  var cfg = require(testsDir + '/capabilities/' + conf);
  cfg.maxInstances = settings.concurrentPerBrowser || 1;
  caps.push(cfg);
});

exports.config = {
  seleniumAddress: settings.seleniumAddress,
  seleniumServerJar: settings.seleniumServerJar,
  chromeDriver: settings.chromeDriver,
  specs: [testsDir + '/**/*Test.js'],
  chromeOnly: false,
  baseUrl: settings.baseUrl,
  onPrepare: function() {
    global.pts = require('protractor-test-suite');
    require('app-module-path').addPath(testsDir);

    if(settings.failsScreenshotDir) {
      jasmine.getEnv().addReporter(new pts.FailScreenshoter(settings.failsScreenshotDir, browser.params.testId || 'default'));
    }
    require('jasmine-expect');
  },
  multiCapabilities: caps,
  maxSessions: settings.concurrent
};
