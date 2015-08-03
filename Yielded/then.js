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
    else r.accept(this.value);
  }else{
    if(typeof onRejected == 'function') tick().listen(call,[onRejected,this.error,r,this]);
    else r.reject(this.error);
  }

}

function call(f,arg,r,yd){
  var v;

  try{

    v = f(arg);
    if(v == r.yielded) return r.reject(new TypeError());

    try{

      if(v && typeof v.then == 'function'){

        v.then(function(value){
          r.accept(value);
        },function(error){
          r.reject(error);
        });

        return;
      }

    }catch(e){ return r.reject(e); }

    r.accept(v);

  }catch(e){ r.reject(e); }

}

/*/ exports /*/

module.exports = then;
