var define = require('u-proto/define'),
    Resolver = require('../../../main'),

    resolver = Symbol(),
    dnt = Symbol(),

    getter = Resolver.Yielded.getter,
    rq = require;

// TODO: add listeners on-demand

module.exports = function(doNotThrow){

  if(!this[resolver]){
    this[resolver] = new Resolver();
    this[dnt] = doNotThrow;

    this.once('error',onceError);
    this.once('finish',onceFinish);
  }

  return this[resolver].yielded;
};

function onceError(e){
  this.removeListener('finish',onceFinish);
  this[resolver].reject(e,this[dnt]);
}

function onceFinish(){
  this.removeListener('error',onceError);
  this[resolver].accept(undefined,this[dnt]);
}

if(global.process && !rq('stream').Writable.prototype.hasOwnProperty(getter))
rq('stream').Writable.prototype[define](getter,module.exports,{writable: true});
