'use strict';

/**
 * Global functionality
 *
 * @constructor
 */
function Core() {

}

/**
 * @static
 * @param {ElementFinder} element
 */
Core.elementHelperWrapper = function (element) {
  if(element.ptor_) {
    // this is real ElementFinder
    // emulate protractor's ElementHelper
    var newElement = element.element.bind(element);
    newElement.all = element.all.bind(element);

    return newElement;
  }else {

    return element;
  }

};

/**
 * Checks if element contains specified class
 * @param {ElementFinder} element
 * @param {string} cssClass
 * @returns {bool}
 */
Core.isElementHasCssClass = function (element, cssClass) {

  return element.getAttribute('class')
    .then(function (classes) {

      return classes.split(' ').indexOf(cssClass) !== -1;
    });
};

/**
 * Run function without synchronization
 * @param {function} fn
 * @returns {webdriver.promise.Promise}
 */
Core.async = function(fn) {
  var oldValue = browser.ignoreSynchronization;
  browser.ignoreSynchronization = true;
  fn();
  browser.ignoreSynchronization = oldValue;
  return browser.waitForAngular();
};

/**
 * Fail when console contains errors after test
 * use it inside main describe function.
 */
Core.failOnConsoleError = function () {
  afterEach(function () {
    browser.manage().logs().get('browser')
      .then(function (browserLog) {
        if(browserLog.length > 0) {
          console.log('browser log' + require('util').inspect(browserLog));
        }
        var msg = 'Number of console errors: ';
        expect(msg + browserLog.length).toBe(msg + 0);
      });

  });
};

module.exports = Core;
