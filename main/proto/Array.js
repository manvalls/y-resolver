var define = require('u-proto/define'),

    Resolver = require('../../main'),
    getter = Resolver.Yielded.getter,
    getYd = Resolver.Yielded.get,
    run;

// TODO: add and remove listeners on-demand

module.exports = function(doNotThrow){
  var arr = [],
      res,errors,i,ctx;

  if(!this.length) return Resolver.accept(arr,doNotThrow);

  res = new Resolver();
  errors = [];
  ctx = {
    remaining: this.length
  };

  for(i = 0;i < this.length;i++) getYd(this[i],doNotThrow).listen(run,[res,arr,errors,ctx,i,doNotThrow]);
  return res.yielded;
};

function run(res,arr,errors,ctx,i,doNotThrow){
  var error;

  if(this.accepted) arr[i] = this.value;
  else{
    errors[i] = this.error;
    ctx.lastError = this.error;
  }

  if(!--ctx.remaining){

    if('lastError' in ctx){
      error = new Error((ctx.lastError || {}).message || ctx.lastError);
      error.stack = (ctx.lastError || {}).stack;

      error.errors = errors;
      error.values = arr;

      res.reject(error,doNotThrow);
    }else res.accept(arr,doNotThrow);

  }

}

if(!Array.prototype.hasOwnProperty(getter))
Array.prototype[define](getter,module.exports,{writable: true});
