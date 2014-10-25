var Promise = require('./../promiz');
GLOBAL.assert = require('assert')
module.exports = {
  resolved: function (value) {
    return Promise.resolve(value)
  },
  rejected: function (error) {
    return Promise.reject(error)
  },
  deferred: function () {
    var promise = new Promise()
    return {
      promise: promise,
      resolve: promise.resolve,
      reject: promise.reject
    }
  },
  defineGlobalPromise: function (scope) {
    scope.Promise = Promise
  },
  removeGlobalPromise: function (scope) {
    delete scope.Promise
  }
};
