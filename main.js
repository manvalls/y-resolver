var Su = require('u-su'),
    
    listeners = Su(),
    lArgs = Su(),
    
    accepted = Su(),
    rejected = Su(),
    done = Su(),
    value = Su(),
    error = Su(),
    
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
  
  done: {get: function(){ return this[done]; }},
  accepted: {get: function(){ return this[accepted]; }},
  rejected: {get: function(){ return this[rejected]; }},
  
  error: {get: function(){ return this[error]; }},
  value: {get: function(){ return this[value]; }}
  
});

// Resolver

module.exports = Resolver = function Resolver(){
  Object.defineProperty(this,'yielded',{value: new Yielded()});
};

Object.defineProperties(Resolver.prototype,{
  
  reject: {value: function(e){
    var i,cb,args;
    
    if(this.yielded.done) return;
    
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
  
  if(Resolver.debug) console.log(e?(e.stack?e:e.stack):e);
  
  resolver.reject(e);
  return resolver.yielded;
};

Resolver.debug = global.process?global.process.env.debug == '':false;
