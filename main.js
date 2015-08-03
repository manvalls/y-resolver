var define = require('u-proto/define'),

    done = Symbol(),
    accepted = Symbol(),
    rejected = Symbol(),

    value = Symbol(),
    error = Symbol(),

    yielded = Symbol(),
    listeners = Symbol(),
    count = Symbol(),

    timeout = Symbol(),

    isYielded = '2Alqg4pLDZMZl8Y',
    toYielded = '4siciY0dau6kkit',

    Setter,bag;

// Resolver

function Resolver(Constructor){
  Constructor = Constructor || Yielded;
  this[yielded] = new Constructor();
}

/*/ exports /*/

module.exports = Resolver;
Resolver.Yielded = Yielded;
Resolver.Hybrid = HybridYielded;

Resolver.isYielded = isYielded;
Resolver.toYielded = toYielded;

Resolver.accept = accept;
Resolver.reject = reject;
Resolver.chain = chain;

/*/ imports /*/

Setter = require('y-setter');

/*/ ******* /*/

Resolver.prototype[define](bag = {

  get yielded(){ return this[yielded]; },

  accept: function(data,lock){
    var yd = this[yielded],
        ls = yd[listeners],
        args;

    if(yd[done]) return;

    yd[done] = true;
    yd[accepted] = true;
    yd[value] = data;

    if(lock) while(args = ls.shift()) lock.take().listen(callCb,[args,yd]);
    else while(args = ls.shift()) callCb(args,yd);
  },

  reject: function(e,lock){
    var yd = this[yielded],
        ls = yd[listeners],
        args;

    if(yd[done]) return;
    yd[timeout] = setTimeout(throwError,0,error);

    yd[done] = true;
    yd[rejected] = true;
    yd[error] = e;

    if(lock) while(args = ls.shift()) lock.take().listen(callCb,[args,yd]);
    else while(args = ls.shift()) callCb(args,yd);
  },

  bind: require('./Resolver/bind.js')

});

// - utils

function callCb(args,yd){
  var cb = args[0],
      ag = args[1] || [],
      th = args[2] || yd;

  try{ cb.apply(th,ag); }
  catch(e){ setTimeout(throwError,0,e); }
}

function throwError(e){
  throw e;
}

// Yielded

function Yielded(prop){

  if(this[listeners]) return;

  if(prop){
    this[prop] = Object.create(Resolver.prototype);
    this[prop][yielded] = this;
  }

  this[done] = false;
  this[accepted] = false;
  this[rejected] = false;

  this[listeners] = [];
  this[count] = new Setter();
  this[count].value = 0;

}

Yielded.prototype[define](isYielded,true);
Yielded.prototype[define]({

  get listeners(){ return this[count].getter; },

  get done(){ return this[done]; },

  get accepted(){
    if(this[timeout] != null) clearTimeout(this[timeout]);
    return this[accepted];
  },

  get rejected(){
    if(this[timeout] != null) clearTimeout(this[timeout]);
    return this[rejected];
  },

  get value(){ return this[value]; },
  get error(){
    if(this[timeout] != null) clearTimeout(this[timeout]);
    return this[error];
  },

  listen: function(){
    this[listeners].push(arguments);
    this[count].value++;
  },

  then: require('./Yielded/then.js')

});

// Hybrid

function HybridYielded(){
  this[yielded] = this;
  Yielded.call(this);
}

HybridYielded.prototype = Object.create(Yielded.prototype);
HybridYielded.prototype[define]('constructor',HybridYielded);
HybridYielded.prototype[define](bag);

// utils

function chain(){
  var last = arguments[arguments.length - 1][yielded],
      i;

  arguments[arguments.length - 1][yielded] = arguments[0][yielded];
  for(i = 0;i < arguments.length - 2;i++) arguments[i][yielded] = arguments[i + 1][yielded];
  arguments[arguments.length - 2][yielded] = last;
}

function accept(v){
  var resolver = new Resolver();

  resolver.accept(v);
  return resolver.yielded;
}

function reject(e){
  var resolver = new Resolver();

  resolver.reject(e);
  return resolver.yielded;
}
