'use strict';

var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');

/**
 * @see {@link https://github.com/juliemr/protractor-demo/blob/master/howtos/screenshot/screenshotReporter.js|original script}
 * @param {string} screenShootDir
 * @param {string} testId
 * @constructor
 */
function FailScreenshoter(screenShootDir, testId) {
  /**
   * @type {string}
   * @private
   */
  this._screenShootDir = path.join(screenShootDir, testId);

  /**
   * @type {number}
   * @private
   */
  this._assertIndex = 0;

  /**
   * @type {function}
   */
  this._originalJasmineAddMatcherResult = jasmine.Spec.prototype.addMatcherResult;

  browser.getCapabilities().then(function (cap) {
    this._screenShootDir = path.join(this._screenShootDir, cap.caps_.browserName);
  }.bind(this));

  this._overrides();
}

/**
 * Takes browser screenshot
 * @param {string} testDescription
 * @param {string|number} id
 * @private
 */
FailScreenshoter.prototype._takeScreenshot = function (testDescription, id) {
  var filename = testDescription.replace(/\s/g, '_') + '_' + id + '.png';

  browser.takeScreenshot().then(function (png) {
    this._saveImage(filename, png);
  }.bind(this));
};

/**
 * Saves image to filesystem
 * @param {string} filename
 * @param png
 * @private
 */
FailScreenshoter.prototype._saveImage = function (filename, png) {
  mkdirp.sync(this._screenShootDir);
  var writePath = path.join(this._screenShootDir, filename);
  var stream = fs.createWriteStream(writePath);
  stream.write(new Buffer(png, 'base64'));
  stream.end();
  console.info('Saved printscreen to: ' + writePath);
};

/**
 * @private
 */
FailScreenshoter.prototype._overrides = function () {
  var screenshoter = this;

  jasmine.Spec.prototype.addMatcherResult = function() {
    screenshoter._assertIndex++;
    if(!arguments[0].passed()) {
      screenshoter._takeScreenshot(this.description, screenshoter._assertIndex);
    }

    return screenshoter._originalJasmineAddMatcherResult.apply(this, arguments);
  };
};

/**
 * @param spec
 */
FailScreenshoter.prototype.reportSpecResults = function (spec) {
  if(!spec.results().passed()) {
    this._takeScreenshot(spec.description, 'end');
  }

  this._assertIndex = 0;
};

module.exports = FailScreenshoter;
