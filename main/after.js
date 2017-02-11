var Resolver = require('../main'),
    yielded = Symbol();

// TODO: use Yielded subclasses

function after(yd){
  var res;

  yd = Resolver.when(yd);
  if(yd[yielded]) return yd[yielded];
  res = new Resolver();
  yd.listen(res.accept,[],res);
  return yd[yielded] = res.yielded;
}

/*/ exports /*/

module.exports = after;
