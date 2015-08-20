var define = require('u-proto/define'),
    Detacher = require('detacher'),

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
    defer =     '1KlIC6JgRPjS0vm',

    Setter,bag;

// Resolver

function Resolver(counter){
  this[yielded] = new Yielded(null,counter);
}

/*/ exports /*/

module.exports = Resolver;
Resolver.Yielded = Yielded;
Resolver.Hybrid = HybridYielded;

Resolver.isYielded = isYielded;
Resolver.toYielded = toYielded;
Resolver.defer = defer;

Resolver.accept = accept;
Resolver.reject = reject;
Resolver.chain = chain;

/*/ imports /*/

Setter = require('y-setter');

/*/ ******* /*/

Resolver.prototype[define](bag = {

  get yielded(){ return this[yielded]; },

  accept: function(data){
    var yd = this[yielded],
        ls = yd[listeners],
        args;

    if(yd[done]) return;

    yd[done] = true;
    yd[accepted] = true;
    yd[value] = data;

    for(args of ls){
      callCb(args,yd);
      detach(args,yd);
    }

  },

  reject: function(e){
    var yd = this[yielded],
        ls = yd[listeners],
        args;

    if(yd[done]) return;
    yd[timeout] = setTimeout(throwError,0,e);

    yd[done] = true;
    yd[rejected] = true;
    yd[error] = e;

    for(args of ls){
      callCb(args,yd);
      detach(args,yd);
    }

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

function Yielded(prop,counter){

  if(this[listeners]) return;

  if(prop){
    this[prop] = Object.create(Resolver.prototype);
    this[prop][yielded] = this;
  }

  this[done] = false;
  this[accepted] = false;
  this[rejected] = false;

  this[listeners] = new Set();

  this[count] = counter || new Setter();
  if(this[count].value == null) this[count].value = 0;

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
    var d = new Detacher(detach,[arguments,this]);

    if(this[done]){
      callCb(arguments,this);
      return d;
    }

    this[listeners].add(arguments);
    this[count].value++;
    return d;
  },

  then: require('./Yielded/then.js')

});

// - utils

function detach(args,yd){
  if(yd[listeners].delete(args)) yd[count].value--;
}

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
