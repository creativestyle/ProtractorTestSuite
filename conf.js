'use strict';

try{
  var testsDir = npm_config_root_testsDir;
}catch(e) {
  console.error('');
  process.exit(e.code);
}

try {
  var settings = require(testsDir + '/settings');
}catch (e) {
  console.error('You have to configure your test environment');
  console.error('Copy tests/e2e/settings.sample.js to tests/e2e/settings.js');
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
  specs: ['**/*Test.js'],
  chromeOnly: false,
  baseUrl: settings.baseUrl,
  onPrepare: function() {
    require('app-module-path').addPath(__dirname);
    require('app-module-path').addPath(testsDir);

    var FailScreenshoter = require('failScreenshoter');
    if(settings.failsScreenshotDir) {
      jasmine.getEnv().addReporter(new FailScreenshoter(settings.failsScreenshotDir, browser.params.testId || 'default'));
    }
    require('jasmine-expect');
  },
  multiCapabilities: caps,
  maxSessions: settings.concurrent
};
