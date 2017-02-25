function isString(x) {
  return typeof x === 'string';
}

function assertTheUnexpected(expect) {
  function AssertionError(err) {
    Error.call(this, err.message);

    this.stack = err.stack;
  }

  AssertionError.prototype = Object.create(Error.prototype);

  function createWrappedExpect(localExpect) {
    return function wrappedExpect() {
      var args = Array.prototype.slice.apply(arguments);
      // convert UnexpectedError to AssertionError
      try {
        localExpect.apply(localExpect, args);
      } catch (err) {
        throw new AssertionError(err);
      }
    };
  }

  var wrappedExpect = createWrappedExpect(expect);

  function checkTruthy(value) {
    wrappedExpect(value, 'to be truthy');
  }

  function prepareDeepEqual(actual, expected) {
    var a = actual;
    var b = expected;

    if (Array.isArray(a) && Array.isArray(b)) {
      a = a.slice(0);
      b = b.slice(0);

      for (var i = 0; i < a.length; i += 1) {
        var comparisonValues = prepareEqual(a[i], b[i]);
        a[i] = comparisonValues.a;
        b[i] = comparisonValues.b;
      }

      return {
        a: a,
        b: b
      };
    }

    return null;
  }

  function prepareEqual(actual, expected) {
    var a = !actual;
    var b = !expected;

    // undo the null and undefined evaluate equal
    if (!(a && b) && !(typeof actual === 'boolean' || typeof expected === 'boolean')) {
      a = actual;
      b = expected;
    }

    if ((Number(a) || Number(b)) && (isString(a) || isString(b))) {
      a = String(a);
      b = String(b);
    }

    return {
      a: a,
      b: b
    };
  }

  return Object.assign(function (value) {
    checkTruthy(value);
  }, {
    AssertionError: AssertionError,
    deepEqual: function deepEqual(actual, expected) {
      var a = actual;
      var b = expected;
      var comparisonValues;

      // first type deep equal preparation
      comparisonValues = prepareDeepEqual(a, b);

      if (!comparisonValues && typeof actual !== 'object' && typeof expected !== 'object') {
        comparisonValues = prepareEqual(actual, expected);
      }

      if (comparisonValues) {
        a = comparisonValues.a;
        b = comparisonValues.b;
      }

      wrappedExpect(a, 'to equal', b);

      // handle the lastIndex property
      if (actual instanceof RegExp && actual.hasOwnProperty('lastIndex')) {
        wrappedExpect(actual.lastIndex, 'to equal', expected.lastIndex);
      }
    },
    deepStrictEqual: function deepStrictEqual(actual, expected) {
      wrappedExpect(actual, 'to equal', expected);
    },
    equal: function equal(actual, expected) {
      var comarisonValues = prepareEqual(actual, expected);
      var a = comarisonValues.a;
      var b = comarisonValues.b;

      wrappedExpect(a, 'to be', b);
    },
    ifError: function ifError(value) {
      wrappedExpect(value, 'to be falsy').then(function () {
        throw value;
      });
    },
    notEqual: function notEqual(actual, expected) {
      wrappedExpect(actual, 'not to be', expected);
    },
    notDeepEqual: function notEqual(actual, expected) {
      wrappedExpect(actual, 'not to equal', expected);
    },
    notStrictEqual: function strictEqual(actual, expected) {
      wrappedExpect(actual, 'not to equal', expected);
    },
    ok: function (value) {
      checkTruthy(value);
    },
    strictEqual: function strictEqual(actual, expected) {
      wrappedExpect(actual, 'to equal', expected);
    },
  });
}

module.exports = assertTheUnexpected(require('unexpected'));
