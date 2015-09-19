var define = require('u-proto/define'),
    Resolver = require('../../main.js'),

    resolver = Symbol(),
    parts = Symbol(),
    str = Symbol(),
    size = Symbol(),

    getter = Resolver.Yielded.getter;

module.exports = function(){

  if(!this[resolver]){
    this[parts] = [];
    this[resolver] = new Resolver();
    this[size] = 0;

    this.on('data',onData);
    this.once('error',onceError);
    this.once('end',onceEnd);
  }

  return this[resolver].yielded;
};

function onData(chunk){
  if(this.maxSize != null && this[size] + chunk.length > this.maxSize) return;

  this[size] += chunk.length;

  if(this[str] != null) this[str] += chunk;
  else if(typeof chunk == 'string') this[str] = Buffer.concat(this[parts]).toString() + chunk;
  else this[parts].push(chunk);
}

function onceError(e){
  this.removeListener('end',onceEnd);
  this.removeListener('data',onData);
  this[resolver].reject(e);
}

function onceEnd(){
  this.removeListener('error',onceError);
  this.removeListener('data',onData);
  this[resolver].accept(this[str] == null ? Buffer.concat(this[parts]) : this[str]);
}

if(global.process && !require('str' + 'eam').Readable.prototype.hasOwnProperty(getter))
require('str' + 'eam').Readable.prototype[define](getter,module.exports,{writable: true});
