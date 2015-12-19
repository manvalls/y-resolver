var Resolver = require('../main.js'),
    promisesAplusTests = require("promises-aplus-tests"),
    adapter = {};

// Promises/A+ spec

adapter.resolved = Resolver.accept;
adapter.rejected = e => Resolver.reject(e,true);

adapter.deferred = function(){
  var res = new Resolver();

  return {
    promise: res.yielded,
    resolve: function(v){ res.accept(v); },
    reject: function(e){ res.reject(e,true); }
  };
};

promisesAplusTests(adapter,function(e){ if(e) process.exit(1); });
