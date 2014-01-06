var Deferred = require('./../promiz.micro');
module.exports = {
  resolved: function (value) {
    var d = new Deferred();
    d.resolve(value);
    return d;
  },
  rejected: function (error) {
    var d = new Deferred();
    d.reject(error);
    return d;
  },
  deferred: function () { return new Deferred(); },
};
