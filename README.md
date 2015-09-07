# Resolver [![Build Status][travis-img]][travis-url] [![Coverage Status][cover-img]][cover-url]

## Sample usage

```javascript
var Resolver = require('y-resolver'),
    res = new Resolver(),
    yd = res.yielded;

setTimeout(function(){
  res.accept('hi');
});

if(!yd.done) yd.listen(function(){
  if(this.accepted) console.log(this.value); // hi
  else throw this.error;
});

yd.then(function(value){
  console.log(value); // hi
});

```

[travis-img]: https://travis-ci.org/manvalls/y-resolver.svg?branch=master
[travis-url]: https://travis-ci.org/manvalls/y-resolver
[cover-img]: https://coveralls.io/repos/manvalls/y-resolver/badge.svg?branch=master&service=github
[cover-url]: https://coveralls.io/github/manvalls/y-resolver?branch=master
