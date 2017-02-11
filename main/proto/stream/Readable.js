var define = require('u-proto/define'),
    Resolver = require('../../../main'),

    resolver = Symbol(),
    parts = Symbol(),
    str = Symbol(),
    size = Symbol(),
    dnt = Symbol(),

    getter = Resolver.Yielded.getter,
    rq = require;

// TODO: add listeners on-demand

module.exports = function(doNotThrow){

  if(!this[resolver]){
    this[resolver] = new Resolver();
    this[dnt] = doNotThrow;
    this[parts] = [];
    this[size] = 0;

    this.on('data',onData);
    this.once('error',onceError);
    this.once('end',onceEnd);
  }

  return this[resolver].yielded;
};

function concat(parts){
  if(parts.length) return parts[0].constructor.concat(parts);
  return '';
}

function onData(chunk){
  if(this.maxSize != null && this[size] + chunk.length > this.maxSize) return;

  this[size] += chunk.length;

  if(this[str] != null) this[str] += chunk;
  else if(typeof chunk == 'string') this[str] = concat(this[parts]).toString() + chunk;
  else this[parts].push(chunk);
}

function onceError(e){
  this.removeListener('end',onceEnd);
  this.removeListener('data',onData);
  this[resolver].reject(e,this[dnt]);
}

function onceEnd(){
  this.removeListener('error',onceError);
  this.removeListener('data',onData);
  this[resolver].accept(this[str] == null ? concat(this[parts]) : this[str],this[dnt]);
}

if(global.process && !rq('stream').Readable.prototype.hasOwnProperty(getter))
rq('stream').Readable.prototype[define](getter,module.exports,{writable: true});
