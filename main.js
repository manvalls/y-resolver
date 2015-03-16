var Su = require('u-su'),
    
    listeners = Su(),
    lArgs = Su(),
    
    accepted = Su(),
    rejected = Su(),
    done = Su(),
    value = Su(),
    error = Su(),
    yielded = Su(),
    inited = Su(),
    
    before = Su(),
    after = Su(),
    
    errorTimeout = Su(),
    
    bag,
    
    Resolver,
    Yielded,
    Hybrid;

// Resolver

module.exports = Resolver = function Resolver(Constructor){
  Constructor = Constructor || Yielded;
  this[yielded] = new Constructor();
  this[yielded][inited] = true;
};

function throwError(e){
  throw e;
}

Object.defineProperties(Resolver.prototype,bag = {
  
  yielded: {get: function(){ return this[yielded]; }},
  
  reject: {value: function(e){
    var yd = this[yielded],
        i,cb,args;
    
    if(yd[done]) return;
    
    yd[errorTimeout] = setTimeout(throwError,0,e);
    
    yd[done] = true;
    yd[rejected] = true;
    yd[error] = e;
    
    while(cb = yd[listeners].shift()){
      args = yd[lArgs].shift();
      cb.apply(yd,args);
    }
    
  }},
  
  accept: {value: function(v){
    var yd = this[yielded],
        i,cb,args;
    
    if(yd[done]) return;
    
    yd[done] = true;
    yd[accepted] = true;
    yd[value] = v;
    
    while(cb = yd[listeners].shift()){
      args = yd[lArgs].shift();
      cb.apply(yd,args);
    }
    
  }}
  
});

// Yielded

Resolver.Yielded = Yielded = function Yielded(prop){
  if(this[inited]) return;
  
  if(prop){
    this[inited] = true;
    this[prop] = Object.create(Resolver.prototype);
    this[prop][yielded] = this;
  }
  
  this[listeners] = [];
  this[lArgs] = [];
  
  this[done] = false;
  this[rejected] = false;
  this[accepted] = false;
}

function toPromiseCb(resolve,reject){
  if(this[accepted]) resolve(this[value]);
  else reject(this[error]);
}

Object.defineProperties(Yielded.prototype,{
  
  listen: {value: function(callback,args){
    this[listeners].push(callback);
    this[lArgs].push(args || []);
  }},
  
  listeners: {get: function(){ return this[listeners].length; }},
  
  toPromise: {value: function(){
    var that = this;
    
    if(this[done]){
      if(this[accepted]) return Promise.accept(this[value]);
      return Promise.reject(this[error]);
    }
    
    return new Promise(function(){
      that.listen(toPromiseCb,arguments);
    });
    
  }},
  
  done: {get: function(){ return this[done]; }},
  
  accepted: {get: function(){
    clearTimeout(this[errorTimeout]);
    return this[accepted];
  }},
  
  rejected: {get: function(){
    clearTimeout(this[errorTimeout]);
    return this[rejected];
  }},
  
  error: {get: function(){
    clearTimeout(this[errorTimeout]);
    return this[error];
  }},
  
  value: {get: function(){ return this[value]; }},
  
  before: {value: function(){
    this[before] = this[before] || new Resolver();
    return this[before].yielded;
  }},
  
  after: {value: function(){
    this[after] = this[after] || new Resolver();
    return this[after].yielded;
  }},
  
  start: {value: function(){
    var res = this[before];
    
    if(!res) return;
    delete this[before];
    
    res.accept();
  }},
  
  end: {value: function(){
    var res = this[after];
    
    if(!res) return;
    delete this[after];
    
    res.accept();
  }},
  
  canBeWalked: {value: true}
  
});

// Hybrid

Resolver.Hybrid = Hybrid = function Hybrid(){
  this[yielded] = this;
  Yielded.call(this);
  
  this[inited] = true;
}

Hybrid.prototype = new Yielded();
Hybrid.prototype.constructor = Hybrid;

Object.defineProperties(Hybrid.prototype,bag);

// Auxiliar functions

Resolver.accept = function(v){
  var resolver = new Resolver();
  
  resolver.accept(v);
  return resolver.yielded;
};

Resolver.reject = function(e){
  var resolver = new Resolver();
  
  resolver.reject(e);
  return resolver.yielded;
};

Resolver.chain = function(){
  var last = arguments[arguments.length - 1][yielded],
      i;
  
  arguments[arguments.length - 1][yielded] = arguments[0][yielded];
  for(i = 0;i < arguments.length - 2;i++) arguments[i][yielded] = arguments[i + 1][yielded];
  arguments[arguments.length - 2][yielded] = last;
};

