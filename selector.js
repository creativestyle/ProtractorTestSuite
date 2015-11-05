'use strict';

var Core = require('core');

/**
 * Abstract Selector class
 *
 * @constructor
 */
function Selector(parent) {
  /**
   * @type {ElementFinder}
   */
  this.element = element;

  this.setParent(parent);
}

/**
 * Sets selector parent or do nothing if element is not false value
 *
 * @param {null|ElementFinder} element
 */
Selector.prototype.setParent = function (element) {
  if (!element) {
    return;
  }

  this.element = Core.elementHelperWrapper(element);
};

/**
 * Easier way to create selector method from angular model name
 *
 * @static
 * @param {string} modelSelector
 * @returns {Function}
 */
Selector.getElementByModel = function (modelSelector) {
  return function () {
    return this.element(by.model(modelSelector));
  };
};

/**
 * Easier way to create selector method from css selector
 *
 * @static
 * @param {string} cssSelector
 * @returns {Function}
 */
Selector.getElementByCss = function (cssSelector) {
  return function () {
    return this.element(by.css(cssSelector));
  };
};

/**
 * Easier way to create selector method from element id
 *
 * @static
 * @param {string} elementId
 * @returns {Function}
 */
Selector.getElementById = function (elementId) {
  return function () {
    return this.element(by.id(elementId));
  };
};

/**
 * Easier way to create selector method from element name attribute
 *
 * @static
 * @param {string} elementName
 * @returns {Function}
 */
Selector.getElementByName = function (elementName) {
  return function () {
    return this.element(by.css('[name="' + elementName + '"]'));
  };
};

module.exports = Selector;
