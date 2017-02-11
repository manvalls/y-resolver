var Resolver = require('../main');

// TODO: add and remove listeners on-demand

function all(it){
  var res = new Resolver(),
      ctx = {},
      i = 0,
      yd;

  ctx.remaining = 1;
  ctx.result = [];

  for(yd of it){
    ctx.remaining++;
    Resolver.when(yd).listen(raceIt,[ctx,res,i]);
    i++;
  }

  if(!--ctx.remaining) res.accept(ctx.result);
  return res.yielded;
}

function raceIt(ctx,res,i){

  if(this.accepted){
    ctx.result[i] = this.value;
    if(!--ctx.remaining) res.accept(ctx.result);
  }else res.reject(this.error);

}

/*/ exports /*/

module.exports = all;
