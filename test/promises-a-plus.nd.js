var Resolver = require('../main.js'),
    promisesAplusTests = require("promises-aplus-tests"),
    adapter = {};

// Promises/A+ spec

adapter.resolved = Resolver.accept;
adapter.rejected = e => Resolver.reject(e,true);
adapter.deferred = () => Resolver.defer(true);

promisesAplusTests(adapter,function(e){ if(e) process.exit(1); });
