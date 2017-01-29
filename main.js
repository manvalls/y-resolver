var define = require('u-proto/define'),
    Setter = require('y-setter'),
    {Getter} = Setter,

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
    Detacher,bag;

// Resolver

class Resolver{

  static get Yielded(){
    return Yielded;
  }

  static get Hybrid(){
    return HybridYielded;
  }

  static is(res){
    return res && res[isResolver];
  }

  static accept(v,doNotThrow){
    var resolver = new Resolver();

    resolver.accept(v,doNotThrow);
    return resolver.yielded;
  }

  static reject(e,doNotThrow){
    var resolver = new Resolver();

    resolver.reject(e,doNotThrow);
    return resolver.yielded;
  }

  static race(it){
    var res = new Resolver(),
        yd;

    for(yd of it) res.bind(Yielded.get(yd));
    return res.yielded;
  }

  static all(it){
    var res = new Resolver(),
        ctx = {},
        i = 0,
        yd;

    ctx.remaining = 1;
    ctx.result = [];

    for(yd of it){
      ctx.remaining++;
      Yielded.get(yd).listen(raceIt,[ctx,res,i]);
      i++;
    }

    if(!--ctx.remaining) res.accept(ctx.result);
    return res.yielded;
  }

  static after(yd){
    var res;

    yd = Yielded.get(yd);
    if(yd[yielded]) return yd[yielded];
    res = new Resolver();
    yd.listen(res.accept,[],res);
    return yd[yielded] = res.yielded;
  }

  static defer(){
    return require('./Resolver/defer').apply(this,arguments);
  }

  constructor(res,yd){

    if(res){
      this[resolver] = res;
      this[yielded] = yd;
    }else this[yielded] = new Yielded();

  }

  get yielded(){ return this[yielded]; }

  accept(data,doNotThrow){
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

  }

  reject(e,doNotThrow){
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

  }

  bind(){
    require('./Resolver/bind.js').apply(this, arguments);
  }

  get [isResolver](){ return true; }
  get ['3asKNsYzcdGduft'](){ return 52; }

}

class Yielded{

  static is(yd){
    return yd && yd[isYielded];
  }

  static get(obj){

    while(!(obj && obj[isYielded])){
      if(!obj) return Resolver.accept(obj);

      if(obj[getter]) obj = obj[getter]();
      else return Resolver.accept(obj);
    }

    return obj;
  }

  static get getter(){
    return getter;
  }

  constructor(prop){

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

  get throws(){
    return this[throws];
  }

  set throws(value){
    if(this[done]) return;
    this[throws] = !!value;
  }

  get listeners(){
    return new ListenersGetter(this);
  }

  get done(){
    return this[done];
  }

  get accepted(){
    if(this[timeout] != null) clearTimeout(this[timeout]);
    return this[accepted];
  }

  get rejected(){
    if(this[timeout] != null) clearTimeout(this[timeout]);
    return this[rejected];
  }

  get value(){
    return this[value];
  }

  get error(){
    if(this[timeout] != null) clearTimeout(this[timeout]);
    return this[error];
  }

  listen(){
    var d = new Detacher(detachCb,[arguments,this]),
        c;

    if(this[done]){
      callCb(arguments,this);
      return d;
    }

    this[listeners].add(arguments);

    if(this[count]){
      c = this[count];
      delete this[count];
      c.accept();
    }

    return d;
  }

  add(){
    var d;

    if(this[done]){
      for(d of arguments) detach(d);
      return;
    }

    for(d of arguments){
      this[col].add(d);

      if(Resolver.Yielded.is(d)) d.listen(this[col].delete,[d],this[col]);
      else if(Resolver.is(d)) d.yielded.listen(this[col].delete,[d],this[col]);
      else if(Getter.is(d)) d.frozen().listen(this[col].delete,[d],this[col]);
      else if(Setter.is(d)) d.getter.frozen().listen(this[col].delete,[d],this[col]);
    }

  }

  remove(){
    var d;
    for(d of arguments) this[col].delete(d);
  }

  call(){
    return require('./Yielded/call.js').apply(this,arguments);
  }

  then(){
    return require('./Yielded/then.js').apply(this,arguments);
  }

  get(){
    return require('./Yielded/get.js').apply(this,arguments);
  }

  get [isYielded](){ return true; }

  get ['3asKNsYzcdGduft'](){ return 51; }

}

class HybridYielded extends Yielded{

  constructor(res){
    super();
    res = res || new Resolver();
    this[resolver] = res;
    this[yielded] = res.yielded;
  }

  get listeners(){ return this[yielded].listeners; }
  get done(){ return this[yielded].done; }
  get accepted(){ return this[yielded].accepted; }
  get rejected(){ return this[yielded].rejected; }
  get value(){ return this[yielded].value; }
  get error(){ return this[yielded].error; }

  listen(cb,args,thisArg){
    return this[yielded].listen(cb,args || [],thisArg || this);
  }

  get yielded(){ return this[yielded]; }

  accept(data,doNotThrow){ return this[resolver].accept(data); }
  reject(e,doNotThrow){ return this[resolver].reject(e,doNotThrow); }
  bind(){ require('./Resolver/bind.js').apply(this, arguments); }
  get [isResolver](){ return true; }
  get ['3asKNsYzcdGduft'](){ return 53; }

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

function detachCb(args,yd){
  var c;

  if(yd[listeners].delete(args) && yd[count]){
    c = yd[count];
    delete yd[count];
    c.accept();
  }
}

function raceIt(ctx,res,i){

  if(this.accepted){
    ctx.result[i] = this.value;
    if(!--ctx.remaining) res.accept(ctx.result);
  }else res.reject(this.error);

}

/*/ exports /*/

module.exports = Resolver;

/*/ imports /*/

require('./proto/Array.js');
require('./proto/Promise.js');
require('./proto/stream/Readable.js');
require('./proto/stream/Writable.js');
require('./proto/Object.js');
Detacher = require('detacher');
