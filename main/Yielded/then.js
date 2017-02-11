var tick = require('y-timers/tick'),
    Resolver = require('../../main');

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
  var v;

  try{
    v = f(arg);
    r.accept(v,!yd.throws);
  }catch(e){ r.reject(e,!yd.throws); }

}

/*/ exports /*/

module.exports = then;
