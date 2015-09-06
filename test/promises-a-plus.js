var Resolver = require('../main.js'),
    promisesAplusTests = require("promises-aplus-tests"),
    adapter = {};

// Promises/A+ spec

Resolver.doNotThrow = true;

adapter.resolved = Resolver.accept;
adapter.rejected = Resolver.reject;

adapter.deferred = function(){
  var res = new Resolver();

  return {
    promise: res.yielded,
    resolve: function(v){ res.accept(v); },
    reject: function(e){ res.reject(e); }
  };
};

promisesAplusTests(adapter,function(e){ });
