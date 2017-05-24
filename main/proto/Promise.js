var define = require('u-proto/define'),
    Resolver = require('../../main'),
    Yielded = Resolver.Yielded,
    getter = Yielded.getter,
    yielded = Symbol();

// TODO: add listeners on-demand

function fromPromise(doNotThrow){
  var then = this.then;
  return fromPromise.withThen(this, then, doNotThrow);
};

fromPromise.withThen = function(that, then, doNotThrow){
  var resolver;

  if(Yielded.is(that)) return that;
  if(that[yielded]) return that[yielded];
  resolver = new Resolver();

  try{ then.call(that, v => resolver.accept(v, doNotThrow), e => resolver.reject(e, doNotThrow)); }
  catch(e){ resolver.reject(e, doNotThrow); }
  return that[yielded] = resolver.yielded;
};

module.exports = fromPromise;
if(global.Promise && !Promise.prototype.hasOwnProperty(getter))
Promise.prototype[define](getter,module.exports,{writable: true, configurable: true});
