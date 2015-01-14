# Resolver

## Sample usage

```javascript
var Resolver = require('y-resolver'),
    res = new Resolver(),
    yd = res.yielded;

setTimeout(function(){
  res.accept('hi');
});

if(!yd.done) yd.listen(function(){
  if(this.accepted) console.log(this.value);
  else throw this.error;
});

```
