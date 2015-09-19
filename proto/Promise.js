var define = require('u-proto/define'),
    Resolver = require('../main.js'),
    getter = Resolver.Yielded.getter,
    yielded = Symbol();

module.exports = function(){
  var resolver;

  if(this[yielded]) return this[yielded];

  resolver = new Resolver();
  this.then(function(v){ resolver.accept(v); },function(e){ resolver.reject(e); });

  return this[yielded] = resolver.yielded;
};

if(global.Promise) Promise.prototype[define](getter,module.exports,{writable: true});
