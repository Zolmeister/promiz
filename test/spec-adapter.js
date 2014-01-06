var Promiz = require('./../promiz');
module.exports = {
  resolved: function (value) {
    var d = Promiz.defer();
    d.resolve(value);
    return d;
  },
  rejected: function (error) {
    var d = Promiz.defer();
    d.reject(error);
    return d;
  },
  deferred: Promiz.defer
};
