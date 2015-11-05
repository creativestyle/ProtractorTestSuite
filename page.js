'use strict';

/**
 * Abstract page
 *
 * @param {string} url to page
 * @constructor
 */
function Page(url) {
  /**
   * Page url
   * @type {string}
   */
  this.url = url;
}

/**
 * Open selected page
 */
Page.prototype.open = function() {
  browser.get(browser.baseUrl + this.url);
  this.init();
  this.maximize();
};

/**
 * Maximizes browser window to fit whole page
 */
Page.prototype.maximize = function () {
  browser.driver.executeScript(function () {
    return {
      width: document.body.scrollWidth,
      height: document.body.scrollHeight
    };
  }).then(function (result) {
    browser.driver.manage().window().setSize(result.width, result.height);
  });
};

Page.prototype.init = function () {

};

module.exports = Page;
