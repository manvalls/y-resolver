var Resolver = require('../main.js');

module.exports = function(){
  var resolver = new Resolver();
  this.listen(listener,[resolver,arguments]);
  return resolver.yielded;
};

function listener(resolver,args){
  if(this.rejected) resolver.reject(this.error);
  else resolver.accept(this.value.apply(this,args));
}
