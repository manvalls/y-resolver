var define = require('u-proto/define'),

    done = Symbol(),
    accepted = Symbol(),
    rejected = Symbol(),

    value = Symbol(),
    error = Symbol(),

    yielded = Symbol(),
    resolver = Symbol(),
    listeners = Symbol(),
    throws = Symbol(),
    count = Symbol(),
    col = Symbol(),

    timeout = Symbol(),

    isYielded =   '2Alqg4pLDZMZl8Y',
    isResolver =  '2C5lbcGski3ClF6',
    getter =      '4siciY0dau6kkit',

    stackSize = 0,
    Setter,Detacher,bag;

// Resolver

function Resolver(res,yd){

  if(res){
    this[resolver] = res;
    this[yielded] = yd;
  }else this[yielded] = new Yielded();

}

/*/ exports /*/

module.exports = Resolver;
Resolver.Yielded = Yielded;
Resolver.Hybrid = HybridYielded;

Yielded.get = getYielded;
Yielded.is = isYieldedFunc;
Yielded.getter = getter;

Resolver.is = isResolverFunc;
Resolver.accept = accept;
Resolver.reject = reject;
Resolver.race = race;
Resolver.all = all;
Resolver.after = after;

Resolver.defer = require('./Resolver/defer');

/*/ imports /*/

require('./proto/Array.js');
require('./proto/Promise.js');
require('./proto/stream/Readable.js');
require('./proto/stream/Writable.js');
require('./proto/Object.js');
Setter = require('y-setter');
Getter = Setter.Getter;
Detacher = require('detacher');

/*/ ******* /*/

Resolver.prototype[define](bag = {

  get yielded(){ return this[yielded]; },

  accept: function(data,doNotThrow){
    var yd,ls,args,d;

    if(this[resolver]) return this[resolver].accept(data);
    yd = this[yielded];
    ls = yd[listeners];
    if(yd[done]) return;

    if(doNotThrow) yd.throws = false;

    yd[done] = true;
    yd[accepted] = true;
    yd[value] = data;

    for(args of ls){
      callCb(args,yd);
      detachCb(args,yd);
    }

    for(d of yd[col]) detach(d);
    yd[col].clear();

  },

  reject: function(e,doNotThrow){
    var yd,ls,args;

    if(this[resolver]) return this[resolver].reject(e,doNotThrow);
    yd = this[yielded];
    ls = yd[listeners];
    if(yd[done]) return;

    if(doNotThrow) yd.throws = false;
    if(yd.throws) yd[timeout] = setTimeout(throwError,0,e);

    yd[done] = true;
    yd[rejected] = true;
    yd[error] = e;

    for(args of ls){
      callCb(args,yd);
      detachCb(args,yd);
    }

    for(d of yd[col]) detach(d);
    yd[col].clear();

  },

  bind: require('./Resolver/bind.js'),
  [isResolver]: true,
  ['3asKNsYzcdGduft']: 52

});

// - utils

function callCb(args,yd){
  var cb = args[0],
      ag = args[1] || [],
      th = args[2] || yd;

  if(!stackSize) setTimeout(resetStackSize,0);
  stackSize++;
  if(stackSize > 500) return setTimeout(callCb,0,args,yd);

  try{ cb.apply(th,ag); }
  catch(e){ setTimeout(throwError,0,e); }

  stackSize--;
}

function detach(d){
  d = d || {};

  if(d.detach) return d.detach();
  if(d.disconnect) return d.disconnect();
  if(d.close) return d.close();
  if(d.kill) return d.kill();
  if(d.pause) return d.pause();
  if(d.freeze) return d.freeze();
  if(d.accept) return d.accept();
  if(d.reject) return d.reject();

}

function resetStackSize(){
  stackSize = 0;
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
  this[throws] = true;

  this[col] = new Set();
  this[listeners] = new Set();

}

Yielded.prototype[define]({

  get throws(){
    return this[throws];
  },

  set throws(value){
    if(this[done]) return;
    this[throws] = !!value;
  },

  get listeners(){ return new ListenersGetter(this); },

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
    var d = new Detacher(detachCb,[arguments,this]);

    if(this[done]){
      callCb(arguments,this);
      return d;
    }

    this[listeners].add(arguments);
    if(this[count]) this[count].resolve();
    return d;
  },

  add: function(){
    var d;

    if(this[done]){
      for(d of arguments) detach(d);
      return;
    }

    for(d of arguments){
      this[col].add(d);

      if(Resolver.Yielded.is(d)) d.listen(this[col].delete,[d],this[col]);
      else if(Resolver.is(d)) d.yielded.listen(this[col].delete,[d],this[col]);
      else if(Setter.Getter.is(d)) d.frozen().listen(this[col].delete,[d],this[col]);
      else if(Setter.is(d)) d.getter.frozen().listen(this[col].delete,[d],this[col]);
    }

  },

  remove: function(){
    var d;
    for(d of arguments) this[col].delete(d);
  },

  call: require('./Yielded/call.js'),
  then: require('./Yielded/then.js'),
  get: require('./Yielded/get.js'),
  [isYielded]: true,
  ['3asKNsYzcdGduft']: 51

});

// - utils

function detachCb(args,yd){
  if(yd[listeners].delete(args) && yd[count]) yd[count].accept();
}

function getYielded(obj){

  while(!(obj && obj[isYielded])){
    if(!obj) return accept(obj);

    if(obj[getter]) obj = obj[getter]();
    else return accept(obj);
  }

  return obj;
}

function isYieldedFunc(yd){
  return yd && yd[isYielded];
}

function isResolverFunc(res){
  return res && res[isResolver];
}

class ListenersGetter extends Getter{

  constructor(yd){
    super();
    this[yielded] = yd;
  }

  get value(){
    return this[yielded][listeners].size;
  }

  frozen(){
    return Resolver.after(this[yielded]);
  }

  touched(){
    this[yielded][count] = this[yielded][count] || new Resolver();
    return this[yielded][count].yielded;
  }

}

// Hybrid

function HybridYielded(res){
  res = res || new Resolver();
  this[resolver] = res;
  this[yielded] = res.yielded;
}

HybridYielded.prototype = Object.create(Yielded.prototype);
HybridYielded.prototype[define]('constructor',HybridYielded);
HybridYielded.prototype[define]('3asKNsYzcdGduft',53);
HybridYielded.prototype[define](bag);

HybridYielded.prototype[define]({

  get listeners(){ return this[yielded].listeners; },
  get done(){ return this[yielded].done; },
  get accepted(){ return this[yielded].accepted; },
  get rejected(){ return this[yielded].rejected; },
  get value(){ return this[yielded].value; },
  get error(){ return this[yielded].error; },
  listen: function(func,args,thisArg){
    args = args || [];
    thisArg = thisArg || this;
    return this[yielded].listen(func,args,thisArg);
  }

});

// utils

function accept(v,doNotThrow){
  var resolver = new Resolver();

  resolver.accept(v,doNotThrow);
  return resolver.yielded;
}

function reject(e,doNotThrow){
  var resolver = new Resolver();

  resolver.reject(e,doNotThrow);
  return resolver.yielded;
}

function race(it){
  var res = new Resolver(),
      yd;

  for(yd of it) res.bind(getYielded(yd));
  return res.yielded;
}

function all(it){
  var res = new Resolver(),
      ctx = {},
      i = 0,
      yd;

  ctx.remaining = 1;
  ctx.result = [];

  for(yd of it){
    ctx.remaining++;
    getYielded(yd).listen(raceIt,[ctx,res,i]);
    i++;
  }

  if(!--ctx.remaining) res.accept(ctx.result);
  return res.yielded;
}

function after(yd){
  var res;

  yd = Yielded.get(yd);
  if(yd[yielded]) return yd[yielded];
  res = new Resolver();
  yd.listen(res.accept,[],res);
  return yd[yielded] = res.yielded;
}

function raceIt(ctx,res,i){

  if(this.accepted){
    ctx.result[i] = this.value;
    if(!--ctx.remaining) res.accept(ctx.result);
  }else res.reject(this.error);

}
