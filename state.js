'use strict';

/**
 * Abstract state
 *
 * @constructor
 */
function State() {

}

/**
 *
 * @param {Form} form
 */
State.prototype.fillForm = function (form) {
  for(var name in this) {
    if (this.hasOwnProperty(name)) {
      form[name] = this[name];
    }
  }
};

module.exports = State;
