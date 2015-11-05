'use strict';

var Core = require('./core');

/**
 * Abstract form
 *
 * @constructor
 */
function Form(parent) {
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
Form.prototype.setParent = function(element) {
  if(!element) {

    return;
  }

  this.element = Core.elementHelperWrapper(element);
};

/**
 * @static
 * @param {Object} object object to with we should append getter/setter
 * @param {string} name
 * @param {ElementFinder} element
 */
Form.createTextElementProxy = function (object, name, element) {
  Object.defineProperty(object, name, {
    get: function () {

      return element.getAttribute('value');
    },
    set: function (value) {
      element.clear();
      element.sendKeys(value);

      // Workaround: lose focus (required to trigger blur event on firefox)
      element.sendKeys(protractor.Key.TAB);
    }
  });
};

/**
 * @static
 * @param {Object} object
 * @param list
 */
Form.createTextElementProxies = function (object, list) {
  for(var name in list) {
    if(list.hasOwnProperty(name)) {
      var element = list[name];
      Form.createTextElementProxy(object, name, element);
    }
  }
};

/**
 * Note: hidden elements are read only!
 * @param {Object} object
 * @param {string} name
 * @param {ElementFinder} element
 */
Form.createHiddenElementProxy = function (object, name, element) {
  Object.defineProperty(object, name, {
    get: function () {

      return element.getAttribute('value');
    }
  });
};

/**
 * @static
 * @param {Object} object
 * @param {string} name
 * @param {ElementArrayFinder} radioElements
 */
Form.createRadioElementProxy = function (object, name, radioElements) {
  Object.defineProperty(object, name, {
    get: function () {
      var deferred = protractor.promise.defer();

      radioElements.each(function (element) {

        // search for selected radio input
        return element.isSelected()
          .then(function (isSelected) {
            if (isSelected) {
              deferred.fulfill(element.getAttribute('value'));
            }
          });

      }).then(function () {

        // if we not resolved promise, there isn't any selected radio, return null
        if (deferred.promise.isPending()) {
          deferred.fulfill(null);
        }
      });

      return deferred.promise;
    },
    set: function (value) {
      var found = false;
      radioElements.each(function (element) {
        return element.getAttribute('value').then(function (attribute) {
          if (attribute === value) {
            found = true;
            return element.click();
          }
        });
      }).then(function () {
        if(!found) {
          console.error('Value isn\'t available for this radio! Value: ' + value);
        }
      });
    }
  });
};

/**
 * Gets element name
 * @callback Form~getElementNameFn
 * @param {ElementFinder} element
 * @return {webdriver.promise.Promise} promise to string
 */

/**
 * Checks if element is currently selected
 * @callback Form~isElementSelectedFn
 * @param {ElementFinder} element
 * @return {webdriver.promise.Promise} promise to bool value
 */

/**
 * Selects state of this element
 * @callback Form~selectElementFn
 * @param {ElementFinder} element
 * @param state state to select
 */

/**
 * @static
 * @param {Object} object
 * @param {string} name
 * @param {ElementArrayFinder} elements
 *
 * @param {Object} functions
 * @param {Form~getElementNameFn} functions.getElementNameFn
 * @param {Form~isElementSelectedFn} functions.isElementSelectedFn
 * @param {Form~selectElementFn} functions.selectElementFn
 *
 * @param {Object} strategy
 * @param {function} strategy.selected mark this element as selected
 * @param {function} strategy.notSelected mark this element as not selected
 * @param {function} strategy.select
 * what state we should set on this element
 * Note: you can return rejected promise when it is not necessary to call functions.selectElementFn
 *
 * @param strategy.initialGet
 */
Form.createCustomElementProxy = function (object, name, elements, functions, strategy) {
  Object.defineProperty(object, name, {
    get: function () {

      return elements.reduce(function (value, element) {

        return functions.isElementSelectedFn(element)
          .then(function (isSelected) {
            if(isSelected) {

              return strategy.selected(element, functions.getElementNameFn, value);
            }else {

              return strategy.notSelected(element, functions.getElementNameFn, value);
            }
          });

      }, strategy.initialGet);
    },
    set: function (value) {
      elements.each(function (element) {

        strategy.select(element, functions.getElementNameFn, value)
          .then(function (state) {
            functions.selectElementFn(element, state);
          })
          .thenCatch(function () {
            // do nothing
          });

      });
    }
  });
};

/**
 * @static
 * @param {Object} object
 * @param {string} name
 * @param {ElementArrayFinder} elements
 *
 * @param {Object} functions
 * @param {Form~getElementNameFn} functions.getElementNameFn
 * @param {Form~isElementSelectedFn} functions.isElementSelectedFn
 * @param {Form~selectElementFn} functions.selectElementFn
 */
Form.createSingleSelectCustomElementProxy = function (object, name, elements, functions) {
  var strategy = {
    initialGet: null,
    selected: function (element, getElementNameFn) {

      return getElementNameFn(element);
    },
    notSelected: function (element, getElementNameFn, value) {

      return value;
    },
    select: function (element, getElementNameFn, value) {

      return getElementNameFn(element)
        .then(function (name) {
          //console.log(name);
          if(name === value) {

            return true;
          }else {

            return protractor.promise.rejected();
          }
        });
    }
  };

  return Form.createCustomElementProxy(object, name, elements, functions, strategy);
};

/**
 * @static
 * @param {Object} object
 * @param {string} name
 * @param {ElementArrayFinder} elements
 *
 * @param {Object} functions
 * @param {Form~getElementNameFn} functions.getElementNameFn
 * @param {Form~isElementSelectedFn} functions.isElementSelectedFn
 * @param {Form~selectElementFn} functions.selectElementFn
 */
Form.createMultipleSelectsCustomElementProxy = function (object, name, elements, functions) {
  var strategy = {
    initialGet: [],
    selected: function (element, getElementNameFn, value) {

      return getElementNameFn(element)
        .then(function (name) {
          value[name] = true;

          return value;
        });
    },
    notSelected: function (element, getElementNameFn, value) {

      return getElementNameFn(element)
        .then(function (name) {
          value[name] = false;

          return value;
        });
    },
    select: function (element, getElementNameFn, value) {

      return getElementNameFn(element)
        .then(function (name) {

          return !!value[name];
        });
    }
  };

  return Form.createCustomElementProxy(object, name, elements, functions, strategy);
};

Form.createSelectElementProxy = function (object, name, element) {
  var elements = element.all(by.css('option'));

  return Form.createSingleSelectCustomElementProxy(object, name, elements, {
    getElementNameFn: function (element) {
      return element.getAttribute('value');
    },
    isElementSelectedFn: function (element) {
      return element.isSelected();
    },
    selectElementFn: function (element) {
      element.click();
    }
  });
};

module.exports = Form;
