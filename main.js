var Su = require('u-su'),
    
    listeners = Su(),
    lArgs = Su(),
    
    accepted = Su(),
    rejected = Su(),
    done = Su(),
    value = Su(),
    error = Su(),
    
    errorTimeout = Su(),
    
    Resolver;

// Yielded

function Yielded(){
  this[listeners] = [];
  this[lArgs] = [];
  
  this[done] = false;
  this[rejected] = false;
  this[accepted] = false;
}

Object.defineProperties(Yielded.prototype,{
  
  listen: {value: function(callback,args){
    this[listeners].push(callback);
    this[lArgs].push(args || []);
  }},
  
  listeners: {get: function(){ return this[listeners].length; }},
  
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
  
  value: {get: function(){ return this[value]; }}
  
});

// Resolver

function throwError(e){
  throw e;
}

module.exports = Resolver = function Resolver(Constructor){
  Constructor = Constructor || Yielded;
  Object.defineProperty(this,'yielded',{value: new Constructor()});
};

Resolver.Yielded = Yielded;

Object.defineProperties(Resolver.prototype,{
  
  reject: {value: function(e){
    var i,cb,args;
    
    if(this.yielded.done) return;
    
    this.yielded[errorTimeout] = setTimeout(throwError,0,e);
    
    this.yielded[done] = true;
    this.yielded[rejected] = true;
    this.yielded[error] = e;
    
    while(cb = this.yielded[listeners].shift()){
      args = this.yielded[lArgs].shift();
      cb.apply(this.yielded,args);
    }
    
  }},
  
  accept: {value: function(v){
    var i,cb,args;
    
    if(this.yielded.done) return;
    
    this.yielded[done] = true;
    this.yielded[accepted] = true;
    this.yielded[value] = v;
    
    while(cb = this.yielded[listeners].shift()){
      args = this.yielded[lArgs].shift();
      cb.apply(this.yielded,args);
    }
    
  }}
  
});

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

