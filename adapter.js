var Resolver = require('./main.js');

Resolver.doNotThrow = true;

exports.resolved = Resolver.accept;
exports.rejected = Resolver.reject;

exports.deferred = function(){
  var res = new Resolver();

  return {
    promise: res.yielded,
    resolve: function(v){ res.accept(v); },
    reject: function(e){ res.reject(e); }
  };
};
