var define = require('u-proto/define'),
    Resolver = require('../../main.js'),

    resolver = Symbol(),

    getter = Resolver.Yielded.getter;


module.exports = function(){

  if(!this[resolver]){
    this[resolver] = new Resolver();

    this.once('error',onceError);
    this.once('finish',onceFinish);
  }

  return this[resolver].yielded;
};

function onceError(e){
  this.removeListener('finish',onceFinish);
  this[resolver].reject(e);
}

function onceFinish(){
  this.removeListener('error',onceError);
  this[resolver].accept();
}

if(global.process)
require('str' + 'eam').Writable.prototype[define](getter,module.exports,{writable: true, configurable: true});
