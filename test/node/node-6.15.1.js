'use strict';
const assert = require('assert');
const a = require('../../lib/assertTheUnexpected');

function makeBlock(f) {
  const args = Array.prototype.slice.call(arguments, 1);
  return function() {
    return f.apply(this, args);
  };
}

function assertThrowsNoMessage(f) {
    assert.throws(f);
}

assert.ok(a.AssertionError.prototype instanceof Error,
          'a.AssertionError instanceof Error');

assert.throws(makeBlock(a, false), a.AssertionError, 'ok(false)');

assert.doesNotThrow(makeBlock(a, true), a.AssertionError, 'ok(true)');

assert.doesNotThrow(makeBlock(a, 'test', 'ok(\'test\')'));

assert.throws(makeBlock(a.ok, false),
              a.AssertionError, 'ok(false)');

assert.doesNotThrow(makeBlock(a.ok, true),
                    a.AssertionError, 'ok(true)');

assert.doesNotThrow(makeBlock(a.ok, 'test'), 'ok(\'test\')');

assert.throws(makeBlock(a.equal, true, false),
              a.AssertionError, 'equal(true, false)');

assert.doesNotThrow(makeBlock(a.equal, null, null),
                    'equal(null, null)');

assert.doesNotThrow(makeBlock(a.equal, undefined, undefined),
                    'equal(undefined, undefined)');

assert.doesNotThrow(makeBlock(a.equal, null, undefined),
                    'equal(null, undefined)');

assert.doesNotThrow(makeBlock(a.equal, true, true), 'equal(true, true)');

assert.doesNotThrow(makeBlock(a.equal, 2, '2'), 'equal(2, \'2\')');

assert.doesNotThrow(makeBlock(a.notEqual, true, false),
                    'notEqual(true, false)');

assert.throws(makeBlock(a.notEqual, true, true),
              a.AssertionError, 'notEqual(true, true)');

assert.throws(makeBlock(a.strictEqual, 2, '2'),
              a.AssertionError, 'strictEqual(2, \'2\')');

assert.throws(makeBlock(a.strictEqual, null, undefined),
              a.AssertionError, 'strictEqual(null, undefined)');

assert.throws(makeBlock(a.notStrictEqual, 2, 2),
              a.AssertionError, 'notStrictEqual(2, 2)');

assert.doesNotThrow(makeBlock(a.notStrictEqual, 2, '2'),
                    'notStrictEqual(2, \'2\')');

// deepEqual joy!
// 7.2
assert.doesNotThrow(makeBlock(a.deepEqual, new Date(2000, 3, 14),
                              new Date(2000, 3, 14)),
                    'deepEqual(new Date(2000, 3, 14), new Date(2000, 3, 14))');

assert.throws(makeBlock(a.deepEqual, new Date(), new Date(2000, 3, 14)),
              a.AssertionError,
              'deepEqual(new Date(), new Date(2000, 3, 14))');

assert.throws(
  makeBlock(a.notDeepEqual, new Date(2000, 3, 14), new Date(2000, 3, 14)),
  a.AssertionError,
  'notDeepEqual(new Date(2000, 3, 14), new Date(2000, 3, 14))'
);

assert.doesNotThrow(makeBlock(
  a.notDeepEqual,
  new Date(),
  new Date(2000, 3, 14)),
                    'notDeepEqual(new Date(), new Date(2000, 3, 14))'
);

// 7.3
assert.doesNotThrow(makeBlock(a.deepEqual, /a/, /a/));
assert.doesNotThrow(makeBlock(a.deepEqual, /a/g, /a/g));
assert.doesNotThrow(makeBlock(a.deepEqual, /a/i, /a/i));
assert.doesNotThrow(makeBlock(a.deepEqual, /a/m, /a/m));
assert.doesNotThrow(makeBlock(a.deepEqual, /a/igm, /a/igm));
assertThrowsNoMessage(makeBlock(a.deepEqual, /ab/, /a/),
              /^AssertionError: \/ab\/ deepEqual \/a\/$/);
assertThrowsNoMessage(makeBlock(a.deepEqual, /a/g, /a/),
              /^AssertionError: \/a\/g deepEqual \/a\/$/);
assertThrowsNoMessage(makeBlock(a.deepEqual, /a/i, /a/),
              /^AssertionError: \/a\/i deepEqual \/a\/$/);
assertThrowsNoMessage(makeBlock(a.deepEqual, /a/m, /a/),
              /^AssertionError: \/a\/m deepEqual \/a\/$/);
assertThrowsNoMessage(makeBlock(a.deepEqual, /a/igm, /a/im),
              /^AssertionError: \/a\/gim deepEqual \/a\/im$/);

{
  const re1 = /a/g;
  re1.lastIndex = 3;

  assertThrowsNoMessage(makeBlock(a.deepEqual, re1, /a/g),
                /^AssertionError: \/a\/g deepEqual \/a\/g$/);
}


// 7.4
assert.doesNotThrow(makeBlock(a.deepEqual, 4, '4'), 'deepEqual(4, \'4\')');
assert.doesNotThrow(makeBlock(a.deepEqual, true, 1), 'deepEqual(true, 1)');
assert.throws(makeBlock(a.deepEqual, 4, '5'),
              a.AssertionError,
              'deepEqual( 4, \'5\')');

// 7.5
// having the same number of owned properties && the same set of keys
assert.doesNotThrow(makeBlock(a.deepEqual, {a: 4}, {a: 4}));
assert.doesNotThrow(makeBlock(a.deepEqual, {a: 4, b: '2'}, {a: 4, b: '2'}));
assert.doesNotThrow(makeBlock(a.deepEqual, [4], ['4']));
assert.throws(makeBlock(a.deepEqual, {a: 4}, {a: 4, b: true}),
              a.AssertionError);
assert.doesNotThrow(makeBlock(a.deepEqual, ['a'], {0: 'a'}));
//(although not necessarily the same order),
assert.doesNotThrow(makeBlock(a.deepEqual, {a: 4, b: '1'}, {b: '1', a: 4}));
const a1 = [1, 2, 3];
const a2 = [1, 2, 3];
a1.a = 'test';
a1.b = true;
a2.b = true;
a2.a = 'test';
assert.throws(makeBlock(a.deepEqual, Object.keys(a1), Object.keys(a2)),
              a.AssertionError);
assert.doesNotThrow(makeBlock(a.deepEqual, a1, a2));

// having an identical prototype property
const nbRoot = {
  toString: function() { return `${this.first} ${this.last}`; }
};

function nameBuilder(first, last) {
  this.first = first;
  this.last = last;
  return this;
}
nameBuilder.prototype = nbRoot;

function nameBuilder2(first, last) {
  this.first = first;
  this.last = last;
  return this;
}
nameBuilder2.prototype = nbRoot;

const nb1 = new nameBuilder('Ryan', 'Dahl');
let nb2 = new nameBuilder2('Ryan', 'Dahl');

assert.doesNotThrow(makeBlock(a.deepEqual, nb1, nb2));

nameBuilder2.prototype = Object;
nb2 = new nameBuilder2('Ryan', 'Dahl');
assert.doesNotThrow(makeBlock(a.deepEqual, nb1, nb2));

// primitives and object
assert.throws(makeBlock(a.deepEqual, null, {}), a.AssertionError);
assert.throws(makeBlock(a.deepEqual, undefined, {}), a.AssertionError);
assert.throws(makeBlock(a.deepEqual, 'a', ['a']), a.AssertionError);
assert.throws(makeBlock(a.deepEqual, 'a', {0: 'a'}), a.AssertionError);
assert.throws(makeBlock(a.deepEqual, 1, {}), a.AssertionError);
assert.throws(makeBlock(a.deepEqual, true, {}), a.AssertionError);
assert.throws(makeBlock(a.deepEqual, Symbol(), {}), a.AssertionError);

// primitive wrappers and object
assert.doesNotThrow(makeBlock(a.deepEqual, new String('a'), ['a']),
                    a.AssertionError);
assert.doesNotThrow(makeBlock(a.deepEqual, new String('a'), {0: 'a'}),
                    a.AssertionError);
assert.doesNotThrow(makeBlock(a.deepEqual, new Number(1), {}),
                    a.AssertionError);
assert.doesNotThrow(makeBlock(a.deepEqual, new Boolean(true), {}),
                    a.AssertionError);

// same number of keys but different key names
assert.throws(makeBlock(a.deepEqual, {a: 1}, {b: 1}), a.AssertionError);

//deepStrictEqual
assert.doesNotThrow(
  makeBlock(a.deepStrictEqual, new Date(2000, 3, 14), new Date(2000, 3, 14)),
  'deepStrictEqual(new Date(2000, 3, 14), new Date(2000, 3, 14))'
);

assert.throws(
  makeBlock(a.deepStrictEqual, new Date(), new Date(2000, 3, 14)),
  a.AssertionError,
  'deepStrictEqual(new Date(), new Date(2000, 3, 14))'
);

assert.throws(
  makeBlock(a.notDeepStrictEqual, new Date(2000, 3, 14), new Date(2000, 3, 14)),
  a.AssertionError,
  'notDeepStrictEqual(new Date(2000, 3, 14), new Date(2000, 3, 14))'
);

assert.doesNotThrow(
  makeBlock(a.notDeepStrictEqual, new Date(), new Date(2000, 3, 14)),
  'notDeepStrictEqual(new Date(), new Date(2000, 3, 14))'
);

// 7.3 - strict
assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/, /a/));
assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/g, /a/g));
assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/i, /a/i));
assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/m, /a/m));
assert.doesNotThrow(makeBlock(a.deepStrictEqual, /a/igm, /a/igm));
assertThrowsNoMessage(
  makeBlock(a.deepStrictEqual, /ab/, /a/),
  /^AssertionError: \/ab\/ deepStrictEqual \/a\/$/
);
assertThrowsNoMessage(
  makeBlock(a.deepStrictEqual, /a/g, /a/),
  /^AssertionError: \/a\/g deepStrictEqual \/a\/$/
);
assertThrowsNoMessage(
  makeBlock(a.deepStrictEqual, /a/i, /a/),
  /^AssertionError: \/a\/i deepStrictEqual \/a\/$/
);
assertThrowsNoMessage(
  makeBlock(a.deepStrictEqual, /a/m, /a/),
  /^AssertionError: \/a\/m deepStrictEqual \/a\/$/
);
assertThrowsNoMessage(
  makeBlock(a.deepStrictEqual, /a/igm, /a/im),
  /^AssertionError: \/a\/gim deepStrictEqual \/a\/im$/
);

{
  const re1 = /a/;
  re1.lastIndex = 3;
  assertThrowsNoMessage(makeBlock(a.deepStrictEqual, re1, /a/),
                /^AssertionError: \/a\/ deepStrictEqual \/a\/$/);
}

// 7.4 - strict
assert.throws(makeBlock(a.deepStrictEqual, 4, '4'),
              a.AssertionError,
              'deepStrictEqual(4, \'4\')');

assert.throws(makeBlock(a.deepStrictEqual, true, 1),
              a.AssertionError,
              'deepStrictEqual(true, 1)');

assert.throws(makeBlock(a.deepStrictEqual, 4, '5'),
              a.AssertionError,
              'deepStrictEqual(4, \'5\')');

// 7.5 - strict
// having the same number of owned properties && the same set of keys
assert.doesNotThrow(makeBlock(a.deepStrictEqual, {a: 4}, {a: 4}));
assert.doesNotThrow(makeBlock(a.deepStrictEqual,
                              {a: 4, b: '2'},
                              {a: 4, b: '2'}));
assertThrowsNoMessage(makeBlock(a.deepStrictEqual, [4], ['4']),
              /^AssertionError: \[ 4 ] deepStrictEqual \[ '4' ]$/);
assertThrowsNoMessage(makeBlock(a.deepStrictEqual, {a: 4}, {a: 4, b: true}),
              /^AssertionError: { a: 4 } deepStrictEqual { a: 4, b: true }$/);
assertThrowsNoMessage(makeBlock(a.deepStrictEqual, ['a'], {0: 'a'}),
              /^AssertionError: \[ 'a' ] deepStrictEqual { '0': 'a' }$/);
//(although not necessarily the same order),
assert.doesNotThrow(makeBlock(a.deepStrictEqual,
                              {a: 4, b: '1'},
                              {b: '1', a: 4}));

assert.throws(makeBlock(a.deepStrictEqual,
                        [0, 1, 2, 'a', 'b'],
                        [0, 1, 2, 'b', 'a']),
              a.AssertionError);

assert.doesNotThrow(makeBlock(a.deepStrictEqual, a1, a2));

// Prototype check
function Constructor1(first, last) {
  this.first = first;
  this.last = last;
}

function Constructor2(first, last) {
  this.first = first;
  this.last = last;
}

const obj1 = new Constructor1('Ryan', 'Dahl');
let obj2 = new Constructor2('Ryan', 'Dahl');

assert.throws(makeBlock(a.deepStrictEqual, obj1, obj2), a.AssertionError);

Constructor2.prototype = Constructor1.prototype;
obj2 = new Constructor2('Ryan', 'Dahl');

assert.doesNotThrow(makeBlock(a.deepStrictEqual, obj1, obj2));

// primitives
assert.throws(makeBlock(assert.deepStrictEqual, 4, '4'),
              a.AssertionError);
assert.throws(makeBlock(assert.deepStrictEqual, true, 1),
              a.AssertionError);
assert.throws(makeBlock(assert.deepStrictEqual, Symbol(), Symbol()),
              a.AssertionError);

const s = Symbol();
assert.doesNotThrow(makeBlock(assert.deepStrictEqual, s, s));


// primitives and object
assert.throws(makeBlock(a.deepStrictEqual, null, {}), a.AssertionError);
assert.throws(makeBlock(a.deepStrictEqual, undefined, {}), a.AssertionError);
assert.throws(makeBlock(a.deepStrictEqual, 'a', ['a']), a.AssertionError);
assert.throws(makeBlock(a.deepStrictEqual, 'a', {0: 'a'}), a.AssertionError);
assert.throws(makeBlock(a.deepStrictEqual, 1, {}), a.AssertionError);
assert.throws(makeBlock(a.deepStrictEqual, true, {}), a.AssertionError);
assert.throws(makeBlock(assert.deepStrictEqual, Symbol(), {}),
              a.AssertionError);


// primitive wrappers and object
assert.throws(makeBlock(a.deepStrictEqual, new String('a'), ['a']),
              a.AssertionError);
assert.throws(makeBlock(a.deepStrictEqual, new String('a'), {0: 'a'}),
              a.AssertionError);
assert.throws(makeBlock(a.deepStrictEqual, new Number(1), {}),
              a.AssertionError);
assert.throws(makeBlock(a.deepStrictEqual, new Boolean(true), {}),
              a.AssertionError);


// Testing the throwing
function thrower(errorConstructor) {
  throw new errorConstructor('test');
}

// the basic calls work
assert.throws(makeBlock(thrower, a.AssertionError),
              a.AssertionError, 'message');
assert.throws(makeBlock(thrower, a.AssertionError), a.AssertionError);
// eslint-disable-next-line no-restricted-syntax
assert.throws(makeBlock(thrower, a.AssertionError));

// if not passing an error, catch all.
// eslint-disable-next-line no-restricted-syntax
assert.throws(makeBlock(thrower, TypeError));

// when passing a type, only catch errors of the appropriate type
let threw = false;
try {
  a.throws(makeBlock(thrower, TypeError), a.AssertionError);
} catch (e) {
  threw = true;
  assert.ok(e instanceof TypeError, 'type');
}
assert.strictEqual(true, threw,
                   'a.throws with an explicit error is eating extra errors',
                   a.AssertionError);
threw = false;

// doesNotThrow should pass through all errors
try {
  a.doesNotThrow(makeBlock(thrower, TypeError), a.AssertionError);
} catch (e) {
  threw = true;
  assert.ok(e instanceof TypeError);
}
assert.strictEqual(true, threw, 'a.doesNotThrow with an explicit error is ' +
                   'eating extra errors');

// key difference is that throwing our correct error makes an assertion error
try {
  a.doesNotThrow(makeBlock(thrower, TypeError), TypeError);
} catch (e) {
  threw = true;
  assert.ok(e instanceof a.AssertionError);
}
assert.strictEqual(true, threw,
                   'a.doesNotThrow is not catching type matching errors');

assert.throws(function() { assert.ifError(new Error('test error')); },
              /^Error: test error$/);
assert.doesNotThrow(function() { assert.ifError(null); });
assert.doesNotThrow(function() { assert.ifError(); });

assert.throws(() => {
  assert.doesNotThrow(makeBlock(thrower, Error), 'user message');
}, /Got unwanted exception. user message/,
              'a.doesNotThrow ignores user message');

// make sure that validating using constructor really works
threw = false;
try {
  assert.throws(
    function() {
      throw ({});
    },
    Array
  );
} catch (e) {
  threw = true;
}
assert.ok(threw, 'wrong constructor validation');

// use a RegExp to validate error message
a.throws(makeBlock(thrower, TypeError), /test/);

// use a fn to validate error object
a.throws(makeBlock(thrower, TypeError), function(err) {
  if ((err instanceof TypeError) && /test/.test(err)) {
    return true;
  }
});

// https://github.com/nodejs/node/issues/3188
threw = false;

let AnotherErrorType;
try {
  const ES6Error = class extends Error {};

  AnotherErrorType = class extends Error {};

  const functionThatThrows = () => {
    throw new AnotherErrorType('foo');
  };

  assert.throws(functionThatThrows, ES6Error);
} catch (e) {
  threw = true;
  assert(e instanceof AnotherErrorType,
         `expected AnotherErrorType, received ${e}`);
}

assert.ok(threw);

/*
// https://github.com/nodejs/node/issues/6416
// Make sure circular refs don't throw.
{
  const b = {};
  b.b = b;

  const c = {};
  c.b = c;

  a.doesNotThrow(makeBlock(a.deepEqual, b, c));
  a.doesNotThrow(makeBlock(a.deepStrictEqual, b, c));

  const d = {};
  d.a = 1;
  d.b = d;

  const e = {};
  e.a = 1;
  e.b = e.a;

  a.throws(makeBlock(a.deepEqual, d, e), /AssertionError/);
  a.throws(makeBlock(a.deepStrictEqual, d, e), /AssertionError/);
}
*/
// GH-7178. Ensure reflexivity of deepEqual with `arguments` objects.
const args = (function() { return arguments; })();
a.throws(makeBlock(a.deepEqual, [], args));
a.throws(makeBlock(a.deepEqual, args, []));

// more checking that arguments objects are handled correctly
{
  // eslint-disable-next-line func-style
  const returnArguments = function() { return arguments; };

  const someArgs = returnArguments('a');
  const sameArgs = returnArguments('a');
  const diffArgs = returnArguments('b');

  a.throws(makeBlock(a.deepEqual, someArgs, ['a']));
  a.throws(makeBlock(a.deepEqual, ['a'], someArgs));
  a.throws(makeBlock(a.deepEqual, someArgs, {'0': 'a'}));
  a.throws(makeBlock(a.deepEqual, someArgs, diffArgs));
  a.doesNotThrow(makeBlock(a.deepEqual, someArgs, sameArgs));
}

const circular = {y: 1};
circular.x = circular;

function testAssertionMessage(actual, expected) {
  try {
    assert.strictEqual(actual, '');
  } catch (e) {
    assert.strictEqual(e.toString(),
                       ['AssertionError:', expected, '===', '\'\''].join(' '));
    assert.ok(e.generatedMessage, 'Message not marked as generated');
  }
}

testAssertionMessage(undefined, 'undefined');
testAssertionMessage(null, 'null');
testAssertionMessage(true, 'true');
testAssertionMessage(false, 'false');
testAssertionMessage(0, '0');
testAssertionMessage(100, '100');
testAssertionMessage(NaN, 'NaN');
testAssertionMessage(Infinity, 'Infinity');
testAssertionMessage(-Infinity, '-Infinity');
testAssertionMessage('', '""');
testAssertionMessage('foo', '\'foo\'');
testAssertionMessage([], '[]');
testAssertionMessage([1, 2, 3], '[ 1, 2, 3 ]');
testAssertionMessage(/a/, '/a/');
testAssertionMessage(/abc/gim, '/abc/gim');
testAssertionMessage(function f() {}, '[Function: f]');
testAssertionMessage(function() {}, '[Function]');
testAssertionMessage(() => {}, '[Function]');
testAssertionMessage({}, '{}');
testAssertionMessage(circular, '{ y: 1, x: [Circular] }');
testAssertionMessage({a: undefined, b: null}, '{ a: undefined, b: null }');
testAssertionMessage({a: NaN, b: Infinity, c: -Infinity},
                     '{ a: NaN, b: Infinity, c: -Infinity }');

// #2893
{
  let threw = false;
  try {
    // eslint-disable-next-line no-restricted-syntax
    assert.throws(function() {
      assert.ifError(null);
    });
  } catch (e) {
    threw = true;
    assert.strictEqual(e.message, 'Missing expected exception..');
  }
  assert.ok(threw);
}
assert.ok(threw);

// https://github.com/nodejs/node-v0.x-archive/issues/5292
try {
  assert.strictEqual(1, 2);
} catch (e) {
  assert.strictEqual(e.toString().split('\n')[0], 'AssertionError: 1 === 2');
  assert.ok(e.generatedMessage, 'Message not marked as generated');
}

try {
  assert.strictEqual(1, 2, 'oh no');
} catch (e) {
  assert.strictEqual(e.toString().split('\n')[0], 'AssertionError: oh no');
  assert.strictEqual(e.generatedMessage, false,
                     'Message incorrectly marked as generated');
}

// Verify that throws() and doesNotThrow() throw on non-function block
function testBlockTypeError(method, block) {
  let threw = true;

  try {
    method(block);
    threw = false;
  } catch (e) {
    assert.strictEqual(e.toString(),
                       'TypeError: "block" argument must be a function');
  }

  assert.ok(threw);
}

testBlockTypeError(assert.throws, 'string');
testBlockTypeError(assert.doesNotThrow, 'string');
testBlockTypeError(assert.throws, 1);
testBlockTypeError(assert.doesNotThrow, 1);
testBlockTypeError(assert.throws, true);
testBlockTypeError(assert.doesNotThrow, true);
testBlockTypeError(assert.throws, false);
testBlockTypeError(assert.doesNotThrow, false);
testBlockTypeError(assert.throws, []);
testBlockTypeError(assert.doesNotThrow, []);
testBlockTypeError(assert.throws, {});
testBlockTypeError(assert.doesNotThrow, {});
testBlockTypeError(assert.throws, /foo/);
testBlockTypeError(assert.doesNotThrow, /foo/);
testBlockTypeError(assert.throws, null);
testBlockTypeError(assert.doesNotThrow, null);
testBlockTypeError(assert.throws, undefined);
testBlockTypeError(assert.doesNotThrow, undefined);

// https://github.com/nodejs/node/issues/3275
assert.throws(() => { throw 'error'; }, (err) => err === 'error');
assert.throws(() => { throw new Error(); }, (err) => err instanceof Error);

// Long values should be truncated for display.
assert.throws(() => {
  assert.strictEqual('A'.repeat(1000), '');
}, new RegExp(`^AssertionError: '${'A'.repeat(127)} === ''$`));
