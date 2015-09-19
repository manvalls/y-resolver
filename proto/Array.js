var define = require('u-proto/define'),

    Resolver = require('../main.js'),
    getter = Resolver.Yielded.getter,
    run;

module.exports = function(){
  var arr = [],
      res,errors,i,ctx;

  if(!this.length) return Resolver.accept(arr);

  res = new Resolver();
  errors = [];
  ctx = {
    remaining: this.length
  };

  for(i = 0;i < this.length;i++) this[i].listen(run,[res,arr,errors,ctx,i]);
  return res.yielded;
};

function run(res,arr,errors,ctx,i){
  var error;

  if(this.accepted) arr[i] = this.value;
  else{
    errors[i] = this.error;
    ctx.lastError = this.error;
  }

  if(!--ctx.remaining){

    if(ctx.lastError){
      error = new Error(ctx.lastError.message);
      error.stack = ctx.lastError.stack;

      error.errors = errors;
      error.values = arr;

      res.reject(error);
    }else res.accept(arr);

  }

}

Array.prototype[define](getter,module.exports,{writable: true, configurable: true});
