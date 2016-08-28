var Setter = require('y-setter');

module.exports = function(prop){
  var setter = new Setter();
  this.listen(listener,[setter,prop]);
  return setter.getter;
};

function listener(setter,prop){
  setter.value = this[prop];
  setter.freeze();
}
