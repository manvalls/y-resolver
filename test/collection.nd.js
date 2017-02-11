var Resolver = require('../main'),
    Setter = require('y-setter'),
    t = require('u-test'),
    assert = require('assert');

t('Yielded as collection',function*(){
  var n = 0,
      col,d,res,s,colR;

  colR = new Resolver();
  col = colR.yielded;
  col.add({ pause: () => n++ });
  col.add({ detach: () => n++ });
  col.add({ disconnect: () => n++ });
  col.add({ close: () => n++ });
  col.add({ kill: () => n++ });
  col.add({ accept: () => n++ });
  col.add(d = { reject: () => n++ });
  col.remove(d);
  col.add(d);
  col.add(null);
  assert.strictEqual(n,0);
  colR.accept();
  assert.strictEqual(n,7);

  colR = new Resolver();
  col = colR.yielded;
  res = new Resolver();
  col.add(res.yielded);
  res.accept();
  col.add(res.yielded);

  colR.accept();
  col.add({ pause: () => n++ });
  assert.strictEqual(n,8);
  col.add({ detach: () => n++ });
  assert.strictEqual(n,9);
  col.add({ disconnect: () => n++ });
  assert.strictEqual(n,10);
  col.add({ close: () => n++ });
  assert.strictEqual(n,11);
  col.add({ kill: () => n++ });
  assert.strictEqual(n,12);
  col.add({ accept: () => n++ });
  assert.strictEqual(n,13);
  col.add({ reject: () => n++ });
  assert.strictEqual(n,14);

  colR = new Resolver();
  col = colR.yielded;
  col.add(res = new Resolver());
  col.add(s = new Setter());
  col.add(s.getter);
  colR.accept();

  yield res;
  yield s.getter.frozen();

});
