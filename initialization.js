'use strict';

function initialization(testsDir) {
  process.env.TEST_DIR = testsDir;
  return __dirname + '/conf.js';
}

function toRequireName(name) {
  return name.substr(0,1).toLowerCase() + name.substr(1);
}

function createRequire(className) {
  return function(){
    return require('./' + toRequireName(className));
  };
}

var classes = [
  'Core',
  'FailScreenshoter',
  'Form',
  'HttpInspector',
  'Page',
  'Selector',
  'State'
];

for(var x in classes) {
  if(classes.hasOwnProperty(x)) {
    var className = classes[x];
    Object.defineProperty(initialization, className, {
      get: createRequire(className)
    });
  }
}

module.exports = initialization;
