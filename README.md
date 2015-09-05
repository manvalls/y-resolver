# Resolver [![Build Status][travis-image]][travis-url]

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

[travis-image]: https://travis-ci.org/manvalls/y-resolver.svg?branch=master
[travis-url]: https://travis-ci.org/manvalls/y-resolver
