var define = require('u-proto/define'),
    Collection = require('detacher/collection'),

    Resolver = require('../main.js'),
    fromReadableStream = require('./stream/Readable.js'),
    fromWritableStream = require('./stream/Writable.js'),
    fromPromise = require('./Promise.js'),

    getter = Resolver.Yielded.getter,
    race;

module.exports = function(){
  var c = new Collection(),
      keys,ctx,i,j,res,errors;

  if(typeof this.toPromise == 'function') return fromPromise.call(this.toPromise());
  if(typeof this.then == 'function') return fromPromise.call(this);
  if(typeof this.pipe == 'function') return fromReadableStream.call(this);
  if(typeof this.end == 'function') return fromWritableStream.call(this);
  if(this.constructor != Object) return Resolver.accept(this);

  keys = Object.keys(this);
  if(!keys.length) return Resolver.accept({});

  res = new Resolver();
  errors = {};

  ctx = {
    remaining: keys.length
  };

  for(j = 0;j < keys.length;j++){
    i = keys[j];
    c.add(
      this[i].listen(race,[res,errors,c,ctx,i])
    );
  }

  return res.yielded;
};

function race(res,errors,c,ctx,i){
  var error;

  if(this.accepted){
    c.detach();
    res.accept({[i]: this.value});
  }else{
    if(!ctx.firstError) ctx.firstError = this.error;
    errors[i] = this.error;
    if(!--ctx.remaining){
      error = new Error(ctx.firstError.message);
      error.stack = ctx.firstError.stack;
      error.errors = errors;

      res.reject(error);
    }
  }

}

if(!Object.prototype.hasOwnProperty(getter))
Object.prototype[define](getter,module.exports,{writable: true});
