var tick = require('y-timers/tick'),
    Resolver = require('../main.js');

function then(onFulfilled,onRejected){
  var r = new Resolver();

  if(this.done) handleThen.call(this,onFulfilled,onRejected,r);
  else this.listen(handleThen,[onFulfilled,onRejected,r]);

  return r.yielded;
}

function handleThen(onFulfilled,onRejected,r){

  if(this.accepted){
    if(typeof onFulfilled == 'function') tick().listen(call,[onFulfilled,this.value,r,this]);
    else r.accept(this.value,!this.throws);
  }else{
    if(typeof onRejected == 'function') tick().listen(call,[onRejected,this.error,r,this]);
    else r.reject(this.error,!this.throws);
  }

}

function call(f,arg,r,yd){
  var ignore = false,
      v,then;

  try{

    v = f(arg);
    if(v == r.yielded) return r.reject(new TypeError(),!yd.throws);

    try{

      if(v && (
          typeof v == 'object' ||
          typeof v == 'function'
        ) && typeof (then = v.then) == 'function'){

        then.call(v,function(value){

          if(ignore) return;
          ignore = true;

          call(PT,value,r,yd);

        },function(error){

          if(ignore) return;
          ignore = true;

          r.reject(error,!yd.throws);

        });

        return;
      }

    }catch(e){ return ignore ? null : r.reject(e,!yd.throws); }

    r.accept(v,!yd.throws);

  }catch(e){ r.reject(e,!yd.throws); }

}

function PT(v){ return v; }

/*/ exports /*/

module.exports = then;
