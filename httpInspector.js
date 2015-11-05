'use strict';

var url = require('url');

/**
 * Allows to requests going through angular's $http
 * @constructor
 */
function HttpInspector() {
  this._initModule();
}

/**
 * Injects required interceptor to angular
 * @private
 */
HttpInspector.prototype._initModule = function () {
  browser.addMockModule('httpInspector_', function () {
    angular.module('httpInspector_', []) // jshint ignore:line
      .config(['$httpProvider', function ($httpProvider) {
        window.httpRequests = [];

        $httpProvider.interceptors.push(function () {

          return {
            request: function (config) {

              // Log only request that will not be cached
              if (!config.cache) {
                window.httpRequests.push({
                  method: config.method,
                  url: config.url,
                  data: config.data,
                  params: config.params
                });
              }

              return config;
            }
          };
        });

      }]);
  });
};

/**
 * Prints all recorded requests to help debug tests
 * @returns {!Promise<string[]>}
 */
HttpInspector.prototype.debugRequests = function () {

  this.getRequests().then(function (requests) {
    console.log(requests);

    return requests;
  });
};

/**
 *
 * @returns {!Promise<string[]>}
 */
HttpInspector.prototype.getRequests = function () {
  return browser.driver.executeScript(function () {

    return window.httpRequests;
  });
};

/**
 * Expect exact specified request
 * @param {!RequestFilter} params
 */
HttpInspector.prototype.expectSingle = function (params) {
  this.expect(params, 1);
};

/**
 * Expect request
 * @param {!RequestFilter} params
 * @param {!number} number
 */
HttpInspector.prototype.expect = function (params, number) {
  this.getRequests()
    .then(function (requests) {

      var count = 0;
      requests.forEach(function (request) {
        if (this._isRequestMatch(request, params)) {

          if (params.params) {
            expect(request.params).toEqual(jasmine.objectContaining(params.params));
          }

          if (params.data) {
            expect(request.data).toEqual(jasmine.objectContaining(params.data));
          }

          count++;
        }
      }, this);


      var msg = 'Requests number: ';
      expect(msg + count).toBe(msg + number);

      return count;
    }.bind(this));
};

/**
 * @readonly
 * @enum {string}
 */
HttpInspector.Method = {
  GET: 'GET',
  HEAD: 'HEAD',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  JSONP: 'JSONP',
  PATCH: 'PATCH'
};

/**
 *
 * @typedef {Object} RequestFilter
 * @property {HttpInspector.Method|string} method
 * @property {!UrlFilter|string} url exact url or {@link UrlFilter}
 * @property {Object} params get parameters (passed to $http)
 * @property {Object} data post parameters
 */

/**
 * @typedef {Object} RequestMetadata
 * @property {!string} method
 * @property {!string} url
 * @property {?Object} data
 * @property {?Object} params
 */

/**
 * @see https://nodejs.org/docs/latest/api/url.html
 * @typedef {Object} UrlFilter
 * @property {string} [href]
 * @property {string} [protocol]
 * @property {string} [slashes]
 * @property {string} [host]
 * @property {string} [auth]
 * @property {string} [hostname]
 * @property {string} [port]
 * @property {string} [pathname]
 * @property {string} [search]
 * @property {string} [path]
 * @property {string} [query]
 * @property {string} [hash]
 */

/**
 * @param {RequestMetadata} request
 * @param {RequestFilter} params
 * @private
 */
HttpInspector.prototype._isRequestMatch = function (request, params) {
  if (!this._isUrlMatch(request.url, params.url)) {

    return false;
  }

  return !(params.method && request.method !== params.method);
};

/**
 *
 * @param {string} address
 * @param {UrlFilter|string} params
 * @private
 */
HttpInspector.prototype._isUrlMatch = function (address, params) {
  if (typeof params === 'string') {
    return address === params;
  }

  var parsed = url.parse(address, false, true);
  return this._compare(parsed, params);
};

/**
 * @param {!Object} object
 * @param {?Object} expected
 */
HttpInspector.prototype._compare = function (object, expected) {
  if (!expected) {

    return true;
  }

  for (var property in expected) {
    if (expected.hasOwnProperty(property)) {
      if (object[property] !== expected[property]) {
        console.log(object[property], expected[property]);
        return false;
      }
    }
  }

  return true;
};

/**
 * @private
 * @type {?HttpInspector}
 */
HttpInspector.instance = null;

/**
 * Gets initialized instance of HttpInspector
 * @returns {HttpInspector}
 */
HttpInspector.getInstance = function () {
  if (!HttpInspector.instance) {
    HttpInspector.instance = new HttpInspector();
  }

  return HttpInspector.instance;
};

module.exports = HttpInspector;
