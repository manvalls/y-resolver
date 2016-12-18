var Resolver = require('../main.js'),
    resolver = Symbol(),
    doNotThrow = Symbol();

class Deferred{

  constructor(){
    this[resolver] = new Resolver();
    this[resolver].yielded.throws = !(this[doNotThrow] = arguments[0]);
  }

  resolve(value){
    this[resolver].accept(value,this[doNotThrow]);
  }

  reject(error){
    this[resolver].reject(error,this[doNotThrow]);
  }

  get promise(){
    return this[resolver].yielded;
  }

}

module.exports = doNotThrow => new Deferred(doNotThrow);
