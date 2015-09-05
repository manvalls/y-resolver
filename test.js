var test = require('u-test'),
    Resolver = require('./main.js'),
    assert = require('assert'),
    Cb = require('y-callback/node'),
    Setter = require('y-setter'),

    isYd = Resolver.isYielded;

function listenOk(yd,accepted,reason){
  var obj1 = {},
      obj2 = {},
      obj3 = {};

  test('Simple listener called',function*(){
    var cb = Cb(),
        that = {};

    yd.listen(function(){ try{

      assert.equal(yd,this);
      assert.equal(arguments.length,0);
      cb();

    }catch(e){ cb(e); } });

    yield cb;

    if(accepted) isAccepted(yd,reason);
    else isRejected(yd,reason);

  });

  test('Listener called with arguments and thisArg',function*(){
    var cb = Cb(),
        that = {};

    yd.listen(function(o1,o2,o3){ try{

      assert.equal(that,this);

      assert.equal(obj1,o1);
      assert.equal(obj2,o2);
      assert.equal(obj3,o3);

      cb();

    }catch(e){ cb(e); } },[obj1,obj2,obj3],that);

    yield cb;

    if(accepted) isAccepted(yd,reason);
    else isRejected(yd,reason);

  });

}

function listenAccepted(yd,value){
  listenOk(yd,true,value);
}

function listenRejected(yd,error){
  listenOk(yd,false,error);
}

function isNotDone(yd){

  test('The Yielded is not done',function(){
    assert(!yd.done);
  });

  test('The Yielded is not accepted',function(){
    assert(!yd.accepted);
  });

  test('The Yielded is not rejected',function(){
    assert(!yd.rejected);
  });

}

function isAccepted(yd){

  test('The Yielded is done',function(){
    assert(yd.done);
  });

  test('The Yielded is accepted',function(){
    assert(yd.accepted);
  });

  test('The Yielded is not rejected',function(){
    assert(!yd.rejected);
  });

}

function isRejected(yd){

  test('The Yielded is done',function(){
    assert(yd.done);
  });

  test('The Yielded is not accepted',function(){
    assert(!yd.accepted);
  });

  test('The Yielded is rejected',function(){
    assert(yd.rejected);
  });

}

function isYielded(yd){

  test('It is a Yielded',function(){
    assert(yd[isYd]);
  });

}

function error(yd,error){

  test('The error is what it should be',function(){
    assert.strictEqual(yd.error,error);
  });

}

function value(yd,value){

  test('The value is what it should be',function(){
    assert.strictEqual(yd.value,value);
  });

}

test('Basic',function(){

  test('Accept',function(){
    var res = new Resolver(),
        obj = {};

    listenAccepted(res.yielded,obj);
    isNotDone(res.yielded);
    value(res.yielded,undefined);
    error(res.yielded,undefined);
    res.accept(obj);
    isAccepted(res.yielded);
    value(res.yielded,obj);
    error(res.yielded,undefined);

  });

  test('Reject',function(){
    var res = new Resolver(),
        obj = {};

    listenRejected(res.yielded,obj);
    isNotDone(res.yielded);
    error(res.yielded,undefined);
    value(res.yielded,undefined);
    res.reject(obj);
    isRejected(res.yielded);
    error(res.yielded,obj);
    value(res.yielded,undefined);

  });

  test('Bind',function(){
    var res = new Resolver(),
        res2 = new Resolver(),
        yd = res2.yielded,
        obj = {};

    res2.bind(res.yielded);

    listenRejected(yd,obj);
    isNotDone(yd);
    error(yd,undefined);
    value(yd,undefined);
    res.reject(obj);
    isRejected(yd);
    error(yd,obj);
    value(yd,undefined);

  });

  test('Listeners',function(){
    var res = new Resolver(),
        yd = res.yielded,
        d,res2,c,yd2;

    d = yd.listen(function(){});
    yd.listen(function(){});
    yd.listen(function(){});

    assert.strictEqual(yd.listeners.value,3);
    d.detach();
    assert.strictEqual(yd.listeners.value,2);
    res.accept();
    assert.strictEqual(yd.listeners.value,0);

    c = new Setter();
    res = new Resolver(c);
    res2 = new Resolver(c);

    yd = res.yielded;
    yd2 = res2.yielded;

    d = yd.listen(function(){});
    yd2.listen(function(){});
    yd.listen(function(){});

    assert.strictEqual(yd.listeners.value,3);
    assert.strictEqual(yd2.listeners.value,3);
    d.detach();
    assert.strictEqual(yd.listeners.value,2);
    assert.strictEqual(yd2.listeners.value,2);
    res.accept();
    assert.strictEqual(yd.listeners.value,1);

  });

});

test('Resolver.accept()',function(){
  var obj = {},
      yd = Resolver.accept(obj);

  isYielded(yd);
  isAccepted(yd);
  value(yd,obj);

});

test('Resolver.reject()',function(){
  var obj = {},
      yd = Resolver.reject(obj);

  isYielded(yd);
  isRejected(yd);
  error(yd,obj);

});

test('Resolver.chain()',function(){
  var h1 = new Resolver.Hybrid(),
      h2 = new Resolver.Hybrid(),
      obj1 = {},
      obj2 = {};

  Resolver.chain(h1,h2);

  listenAccepted(h1,obj1);
  isNotDone(h1);
  value(h1,undefined);
  error(h1,undefined);
  h2.accept(obj1);
  isAccepted(h1);
  value(h1,obj1);
  error(h1,undefined);

  listenRejected(h2,obj2);
  isNotDone(h2);
  error(h2,undefined);
  value(h2,undefined);
  h1.reject(obj2);
  isRejected(h2);
  error(h2,obj2);
  value(h2,undefined);

});
