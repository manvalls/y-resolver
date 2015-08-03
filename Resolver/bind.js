var Detacher = require('detacher');

function resolve(res,yd,d){
  if(!d.active) return;
  
  if(yd.accepted) res.accept(yd.value);
  else res.reject(yd.error);
}

function bind(yd){
  var d = new Detacher();

  if(yd.done) resolve(this,yd,d);
  else yd.listen(resolve,[this,yd,d]);

  return d;
}

/*/ exports /*/

module.exports = bind;
