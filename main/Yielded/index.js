var Setter = require('y-setter'),
    Getter = Setter.Getter,

    yielded = Symbol(),
    throws = Symbol(),
    count = Symbol(),
    listeners = Symbol(),
    collection = Symbol(),

    isYielded =   '2Alqg4pLDZMZl8Y',
    getter =      '4siciY0dau6kkit',

    stackSize = 0,
    Detacher, Resolver;

class Yielded{

  static is(yd){
    return yd && yd[isYielded];
  }

  static get(obj, doNotThrow){
    Resolver = Resolver || require('../../main');

    while(!Yielded.is(obj)){
      if(!obj) return Resolver.accept(obj, doNotThrow);
      if(obj[getter]) obj = obj[getter](doNotThrow);
      else return Resolver.accept(obj, doNotThrow);
    }

    return obj;
  }

  static get getter(){
    return getter;
  }

  constructor(){
    this[throws] = true;
    this[collection] = new Set();
    this[listeners] = new Set();
  }

  // Default behaviour

  get accepted(){ return false; }
  get rejected(){ return false; }
  get value(){ }
  get error(){ }

  // Listeners handling

  listen(){
    var d, c;

    Detacher = Detacher || require('detacher');
    d = new Detacher(detachCb,[arguments,this]);

    if(this.done){
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

  get listeners(){
    return new ListenersGetter(this);
  }

  flush(){
    var ls = this[listeners],
        col = this[collection],
        args, d;

    if(!this.done) return;

    for(args of ls){
      detachCb(args,this);
      callCb(args,this);
    }

    // FIXME: clean listeners from yd.add()
    for(d of col) detach(d);
    col.clear();
  }

  // Detacher logic

  add(){
    var col = this[collection],
        d;

    if(this.done){
      for(d of arguments) detach(d);
      return;
    }

    for(d of arguments){
      col.add(d);

      // IDEA: make Getters and Yieldeds smarter to avoid listeners

      if(Yielded.is(d)) d.listen(col.delete,[d],col);
      else if(d && Yielded.is(d.yielded)) d.yielded.listen(col.delete,[d],col);
      else if(Getter.is(d)) d.frozen().listen(col.delete,[d],col);
      else if(Setter.is(d)) d.getter.frozen().listen(col.delete,[d],col);
    }

  }

  remove(){
    var col = this[collection],
        d;

    // FIXME: clean listeners from yd.add()
    for(d of arguments) col.delete(d);
  }

  // Extra methods

  call(){ return require('./call').apply(this, arguments); }
  then(){ return require('./then').apply(this, arguments); }
  catch(){ return this.then(null, ...arguments); }
  get(){ return require('./get').apply(this, arguments); }

  finally(cb){
    var errored = false,
        value, error;

    return this.then(v => {
      value = v;
      return cb();
    }, e => {
      errored = true;
      error = e;
      return cb();
    }).then(() => {
      if(errored) throw error;
      return value;
    });

  }

  // Useful methods and getters

  get done(){
    return this.accepted || this.rejected;
  }

  get throws(){
    return this[throws];
  }

  set throws(value){
    if(this.done) return;
    this[throws] = !!value;
  }

  get [isYielded](){ return true; }

  get ['3asKNsYzcdGduft'](){ return 51; }

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
    Resolver = Resolver || require('../../main');
    return Resolver.after(this[yielded]);
  }

  touched(){
    Resolver = Resolver || require('../../main');
    this[yielded][count] = this[yielded][count] || new Resolver();
    return this[yielded][count].yielded;
  }

}

// Handlers

function detachCb(args,yd){
  var c;

  if(yd[listeners].delete(args) && yd[count]){
    c = yd[count];
    delete yd[count];
    c.accept();
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

/*/ exports /*/

module.exports = Yielded;
