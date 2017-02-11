var Setter = require('y-setter');

// TODO: implement this using Getter subclasses

module.exports = function(prop,td){
  var setter = new Setter(),
      d;

  setter.value = this[prop];
  d = this.listen(listener,[setter,prop]);
  if(td) td.add(d,setter);
  return setter.getter;
};

function listener(setter,prop){
  setter.value = this[prop];
  setter.freeze();
}
