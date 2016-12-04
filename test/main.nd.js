var Resolver = require('../main.js'),
    test = require('u-test'),
    Yielded = Resolver.Yielded,
    Hybrid = Resolver.Hybrid,
    assert = require('assert'),
    Cb = require('y-callback'),
    Setter = require('y-setter'),
    wait = require('y-timers/wait'),
    domain = require('domain'),
    Detacher = require('detacher'),
    fs = require('fs');

function listenOk(yd,accepted,reason){
  var obj1 = {},
      obj2 = {},
      obj3 = {};

  test('Simple listener called',function*(){
    var cb;

    cb = Cb(function(){
      assert.equal(yd,this);
      assert.equal(arguments.length,0);
    });

    yd.listen(cb);
    yield cb;

    if(accepted) isAccepted(yd,reason);
    else isRejected(yd,reason);

  });

  test('Listener called with arguments and thisArg',function*(){
    var that = {},
        cb;

    cb = Cb(function(o1,o2,o3){
      assert.equal(that,this);
      assert.equal(obj1,o1);
      assert.equal(obj2,o2);
      assert.equal(obj3,o3);
    });

    yd.listen(cb,[obj1,obj2,obj3],that);
    yield cb;

    if(accepted) isAccepted(yd,reason);
    else isRejected(yd,reason);

  });

  if(yd.done) test('Throwing listener',function*(){
    var obj = {},
        d = domain.create(),
        cb,flag;

    d.on('error',cb = Cb(function(e){
      assert.equal(e,obj);
    }));

    d.run(function(){
      yd.listen(function(){
        throw obj;
      });

      flag = true;
    });

    assert(flag);
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
    assert(Yielded.is(yd));
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
    var res = new Hybrid(),
        obj = {};

    assert(Resolver.is(res));
    listenAccepted(res,obj);
    isNotDone(res);
    value(res,undefined);
    error(res,undefined);
    res.accept(obj);
    isAccepted(res);
    value(res,obj);
    error(res,undefined);

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
    var res = new Hybrid(),
        res2 = new Resolver(),
        yd = res2.yielded,
        obj = {};

    res2.bind(res);

    isNotDone(yd);
    error(yd,undefined);
    value(yd,undefined);
    res.reject(obj);
    listenRejected(yd,obj);
    isRejected(yd);
    error(yd,obj);
    value(yd,undefined);

  });

  test('Listeners',function(){
    var res = new Hybrid(),
        yd = res,
        d,res2,c,yd2;

    d = yd.listen(function(){});
    yd.listen(function(){});
    yd.listen(function(){});

    assert.strictEqual(yd.listeners.value,3);
    d.detach();
    assert.strictEqual(yd.listeners.value,2);
    res.accept();
    assert.strictEqual(yd.listeners.value,0);

  });

  test('\'resolver\' property',function(){
    var yd = new Resolver.Yielded('resolver'),
        res = yd.resolver,
        obj = {};

    assert.equal(res.yielded,yd);

    listenAccepted(res.yielded,obj);
    isNotDone(res.yielded);
    value(res.yielded,undefined);
    error(res.yielded,undefined);
    res.accept(obj);
    isAccepted(res.yielded);
    value(res.yielded,obj);
    error(res.yielded,undefined);

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

test('Resolver.race()',function(){
  var r1 = new Resolver(),
      r2 = new Resolver(),
      y1 = r1.yielded,
      y2 = r2.yielded,
      race = Resolver.race([y1,y2]),
      obj = {};

  r2.accept(obj);
  assert.strictEqual(race.value,obj);

  r1 = new Resolver.Hybrid();
  r2 = new Resolver.Hybrid();
  y1 = r1.yielded;
  y2 = r2.yielded;
  race = Resolver.race([y1,y2]);
  obj = {};

  r1.reject(obj);
  assert.strictEqual(race.error,obj);

});

test('Resolver.all()',function(){
  var r1 = new Resolver(),
      r2 = new Resolver(),
      y1 = r1.yielded,
      y2 = r2.yielded,
      all = Resolver.all([y1,y2]),
      obj1 = {},
      obj2 = {};

  r2.accept(obj2);
  assert(!all.done);
  r1.accept(obj1);
  assert.deepEqual(all.value,[obj1,obj2]);

  r1 = new Resolver();
  r2 = new Resolver();
  y1 = r1.yielded;
  y2 = r2.yielded;
  all = Resolver.all([y1,y2]);
  obj1 = {};

  r1.reject(obj1);
  assert.strictEqual(all.error,obj1);

  r2 = new Resolver();
  y1 = Resolver.accept('foo');
  y2 = r2.yielded;
  all = Resolver.all([y1,y2]);

  assert(!all.done);
  r2.accept('bar');
  assert(all.done);
  assert.deepEqual(all.value,['foo','bar']);
});

test('proto',function*(){

  test('Array',function(){
    var r1 = new Resolver(),
        r2 = new Resolver(),
        y1 = r1.yielded,
        y2 = r2.yielded,
        all = Yielded.get([y1,y2]),
        obj1 = {},
        obj2 = {};

    r2.accept(obj2);
    assert(!all.done);
    r1.accept(obj1);
    assert.deepEqual(all.value,[obj1,obj2]);

    r1 = new Resolver();
    r2 = new Resolver();
    y1 = r1.yielded;
    y2 = r2.yielded;
    all = Yielded.get([y1,y2]);
    obj1 = {};

    r1.reject(obj1);
    r2.accept('foo');
    assert.strictEqual(all.error.errors[0],obj1);
    assert.strictEqual(all.error.values[1],'foo');

    r2 = new Resolver();
    y1 = Resolver.accept('foo');
    y2 = r2.yielded;
    all = Yielded.get([y1,y2]);

    assert(!all.done);
    r2.accept('bar');
    assert(all.done);
    assert.deepEqual(all.value,['foo','bar']);
  });

  test('Object',function(){
    var r1 = new Resolver(),
        r2 = new Resolver(),
        y1 = r1.yielded,
        y2 = r2.yielded,
        race = Yielded.get({
          [1]: y1,
          [2]: y2
        }),
        obj = {};

    r1.reject('boo');
    assert(!race.done);
    r2.accept(obj);
    assert.strictEqual(race.value[2],obj);

    r1 = new Resolver();
    r2 = new Resolver();
    y1 = r1.yielded;
    y2 = r2.yielded;

    race = Yielded.get({
      [1]: y1,
      [2]: y2
    });

    obj = {};

    r1.reject(obj);
    r2.reject('boo');
    assert.strictEqual(race.error.errors[1],obj);
    assert.strictEqual(race.error.errors[2],'boo');
  });

  test('Promise',function*(){
    var p = Promise.reject(),
        yd = Yielded.get(p),
        cb;

    isNotDone(yd);
    yd.listen(cb = Cb()),yield cb;
    isRejected(yd);

    p = Promise.resolve();
    yd = Yielded.get(p);

    isNotDone(yd);
    yd.listen(cb = Cb()),yield cb;
    isAccepted(yd);
  });

  test('Yielded.get(Object.create(null))',function*(){
    var obj = Object.create(null);

    assert.strictEqual(yield Yielded.get(obj),obj);
  });

  yield test('stream.Writable',function*(){
    var ws = fs.createWriteStream('./foo/bar'),
        yd = Yielded.get(ws),
        cb;

    isNotDone(yd);
    yd.listen(cb = Cb()),yield cb;
    isRejected(yd);

    ws = fs.createWriteStream('foo');
    yd = Yielded.get(ws);

    isNotDone(yd);
    ws.end('bar');
    yd.listen(cb = Cb()),yield cb;
    isAccepted(yd);
  });

  yield test('stream.Readable',function*(){
    var ws = fs.createReadStream('fasdasdasd'),
        yd = Yielded.get(ws),
        cb;

    isNotDone(yd);
    yd.listen(cb = Cb()),yield cb;
    isRejected(yd);

    ws = fs.createReadStream('foo',{encoding: 'utf-8'});
    yd = Yielded.get(ws);

    isNotDone(yd);
    yd.listen(cb = Cb()),yield cb;
    value(yd,'bar');

    ws = fs.createReadStream('foo');
    yd = Yielded.get(ws);

    isNotDone(yd);
    yd.listen(cb = Cb()),yield cb;
    assert.strictEqual(yd.value.toString(),'bar');
  });

  fs.unlinkSync('foo');

});

test('yd.call()',function*(){
  var yd = Resolver.accept((n1,n2) => n1 + n2),
      ok;

  assert.equal(yield yd.call(1,2),3);
  yd = Resolver.reject();

  try{
    yield yd.call('foo');
    ok = true;
  }catch(e){}

  assert(!ok);
});

test('Max stack size',function*(){
  var k = 0;

  function count(){
    k++;
    if(k < 600) Resolver.accept().listen(count);
  }

  count();
  assert(k < 600);
  yield wait(100);
  assert.strictEqual(k,600);
});

test('Delegation',function*(){
  var r1 = new Resolver(),
      r2 = new Resolver(),
      r3 = new Resolver(r1,r2.yielded);

  r3.accept('foo');
  assert.strictEqual(r1.yielded.value,'foo');
  assert(!r3.yielded.done);

  r2.accept('bar');
  assert.strictEqual(r3.yielded.value,'bar');
});

test('yd.get',function*(){
  var r = new Resolver(),
      d,g;

  r.accept(42);

  assert.strictEqual(r.yielded.get('done').value,true);
  assert.strictEqual(r.yielded.get('accepted').value,true);
  assert.strictEqual(r.yielded.get('rejected').value,false);
  assert.strictEqual(r.yielded.get('value').value,42);

  r = new Resolver();
  d = new Detacher();

  g = r.yielded.get('done',d);
  d.detach();

  assert.strictEqual(g.value,false);
  yield g.frozen();
});
