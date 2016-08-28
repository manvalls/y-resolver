var Detacher = require('detacher');

function resolve(res,yd,d){
  if(yd.accepted) res.accept(yd.value);
  else res.reject(yd.error);
}

function bind(yd){
  var d = new Detacher();

  d.add(
    yd.listen(resolve,[this,yd,d])
  );

  this.yielded.listen(d.detach,[],d);
  return d;
}

/*/ exports /*/

module.exports = bind;
