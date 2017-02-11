var Resolver = require('../main');

function race(it){
  var res = new Resolver(),
      yd;

  for(yd of it) res.bind(Resolver.when(yd));
  return res.yielded;
}

/*/ exports /*/

module.exports = race;
