var Yielded = require('./Yielded'),
    isYielded =   '2Alqg4pLDZMZl8Y',
    isResolver =  '2C5lbcGski3ClF6',

    resolver = Symbol(),
    yielded = Symbol(),
    accepted = Symbol(),
    rejected = Symbol(),
    error = Symbol(),
    value = Symbol(),
    accepted = Symbol(),
    resolved = Symbol(),
    timeout = Symbol(),

    fromPromise;

class Resolver{

  static get Yielded(){
    return ResolvedYielded;
  }

  static get Hybrid(){
    return HybridYielded;
  }

  static is(res){
    return res && res[isResolver];
  }

  static accept(v,doNotThrow){
    // IDEA: we could use Yielded subclasses here
    var resolver = new Resolver();
    resolver.accept(v,doNotThrow);
    return resolver.yielded;
  }

  static reject(e,doNotThrow){
    // IDEA: we could use Yielded subclasses here
    var resolver = new Resolver();
    resolver.reject(e,doNotThrow);
    return resolver.yielded;
  }

  static when(yd){
    if(Yielded.is(yd)) return yd;
    return Resolver.accept(yd);
  }

  static try(cb){
    var res = new Resolver();
    try{ res.accept(cb()); }
    catch(e){ res.reject(e); }
    return res.yielded;
  }

  static race(){ return require('./race').apply(this,arguments); }
  static all(){ return require('./all').apply(this,arguments); }
  static after(){ return require('./after').apply(this,arguments); }

  static defer(doNotThrow){
    var res = new Resolver();
    res.yielded.throws = !doNotThrow;
    return res;
  }

  constructor(res,yd){

    if(res){
      this[resolver] = res;
      this[yielded] = yd;
    }else{
      this[resolved] = false;
      this[yielded] = new ResolvedYielded();
      this[yielded][accepted] = false;
      this[yielded][rejected] = false;
    }

  }

  get yielded(){ return this[yielded]; }

  accept(v,doNotThrow){
    var yd = this[yielded],
        ws = new WeakSet();

    if(this[resolver]) return this[resolver].accept(v,doNotThrow);
    if(this[resolved]) return;

    this[resolved] = true;
    if(doNotThrow) yd.throws = false;

    ws.add(yd);
    follow(v,yd,ws);
  }

  reject(e,doNotThrow){
    var yd = this[yielded];

    if(this[resolver]) return this[resolver].reject(e,doNotThrow);
    if(this[resolved]) return;

    this[resolved] = true;
    if(doNotThrow) yd.throws = false;
    if(yd.throws) yd[timeout] = setTimeout(throwError,0,e);

    yd[rejected] = true;
    yd[error] = e;
    yd.flush();
  }

  bind(){ return require('./bind').apply(this, arguments); }
  get [isResolver](){ return true; }
  get [Symbol.for('ebjs/label')](){ return 52; }

  // Deferred compat

  static resolve(){ return Resolver.accept.apply(this,arguments); }
  resolve(){ return this.accept.apply(this,arguments); }
  get promise(){ return this.yielded; }

}

class ResolvedYielded extends Yielded{

  constructor(prop){

    super();

    if(prop){
      this[prop] = new Resolver();
      this[prop][yielded] = this;
      this[accepted] = false;
      this[rejected] = false;
    }

  }

  get accepted(){ return this[accepted]; }
  get rejected(){ return this[rejected]; }
  get value(){ return this[value]; }

  get error(){
    clearTimeout(this[timeout]);
    return this[error];
  }

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

  listen(cb,args,thisArg){ return this[yielded].listen(cb,args || [],thisArg || this); }
  get yielded(){ return this[yielded]; }

  accept(v,doNotThrow){ return this[resolver].accept(v); }
  reject(e,doNotThrow){ return this[resolver].reject(e,doNotThrow); }
  bind(){ require('./bind').apply(this, arguments); }
  get [isResolver](){ return true; }
  get [Symbol.for('ebjs/label')](){ return 53; }

  // Deferred compat

  resolve(){ return this.accept.apply(this,arguments); }
  get promise(){ return this.yielded; }

}

// - utils

function throwError(e){
  throw e;
}

function follow(v, yd, ws){
  var e,y,then;

  if(ws.has(v)){
    e = new TypeError('Promise cycle detected');
    if(yd.throws) yd[timeout] = setTimeout(throwError,0,e);

    yd[rejected] = true;
    yd[error] = e;
    yd.flush();
    return;
  }

  if(v && (typeof v == 'object' || typeof v == 'function')) try{

    then = v.then;
    if(typeof then == 'function'){
      y = fromPromise.withThen(v, then, true);
      ws.add(v);
      ws.add(y);

      y.listen(listen,[yd,ws]);
      return;
    }

  }catch(e){
    if(yd.throws) yd[timeout] = setTimeout(throwError,0,e);
    yd[rejected] = true;
    yd[error] = e;
    yd.flush();
    return;
  }

  yd[accepted] = true;
  yd[value] = v;
  yd.flush();

}

function listen(yd, ws){

  if(this.rejected){
    if(yd.throws) yd[timeout] = setTimeout(throwError,0,this.error);
    yd[rejected] = true;
    yd[error] = this.error;
    yd.flush();
    return;
  }

  follow(this.value,yd,ws);

}

/*/ exports /*/

module.exports = Resolver;
require('./proto/Array.js');
fromPromise = require('./proto/Promise.js');
require('./proto/stream/Readable.js');
require('./proto/stream/Writable.js');
require('./proto/Object.js');
