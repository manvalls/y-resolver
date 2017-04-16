var define = require('u-proto/define'),

    Resolver = require('../../main'),
    fromReadableStream = require('./stream/Readable.js'),
    fromWritableStream = require('./stream/Writable.js'),
    fromPromise = require('./Promise.js'),

    getter = Resolver.Yielded.getter,
    getYd = Resolver.Yielded.get,
    Detacher,race;

// TODO: add and remove listeners on-demand

module.exports = function(doNotThrow){
  var c,keys,ctx,i,j,res,errors,then;

  if(typeof this.toPromise == 'function') return fromPromise.call(this.toPromise(), doNotThrow);

  try{
    then = this.then;
    if(typeof then == 'function') return fromPromise.withThen(this, then, doNotThrow);
  }catch(e){ return Resolver.reject(e, doNotThrow); }

  if(typeof this.pipe == 'function') return fromReadableStream.call(this, doNotThrow);
  if(typeof this.end == 'function') return fromWritableStream.call(this, doNotThrow);
  if(this.constructor != Object) return Resolver.accept(this, doNotThrow);

  keys = Object.keys(this);
  if(!keys.length) return Resolver.accept({}, doNotThrow);

  Detacher = Detacher || require('detacher');
  c = new Detacher();
  res = new Resolver();
  errors = {};

  ctx = {
    remaining: keys.length
  };

  for(j = 0;j < keys.length;j++){
    i = keys[j];
    c.add(
      getYd(this[i],doNotThrow).listen(race,[res,errors,c,ctx,i,doNotThrow])
    );
  }

  return res.yielded;
};

function race(res,errors,c,ctx,i,doNotThrow){
  var error;

  if(this.accepted){
    c.detach();
    res.accept({[i]: this.value},doNotThrow);
  }else{
    if(!('firstError' in ctx)) ctx.firstError = this.error;
    errors[i] = this.error;
    if(!--ctx.remaining){
      error = new Error((ctx.firstError || {}).message || ctx.firstError);
      error.stack = (ctx.firstError || {}).stack;
      error.errors = errors;

      res.reject(error,doNotThrow);
    }
  }

}

if(!Object.prototype.hasOwnProperty(getter))
Object.prototype[define](getter,module.exports,{writable: true});
