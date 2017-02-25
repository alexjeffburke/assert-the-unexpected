function convertObjectToArray(obj) {
  var outputArray = [];

  Object.keys(obj).forEach(function (key) {
    var keyAsIndex = Number(key);
    if (!isNaN(keyAsIndex) && keyAsIndex > -1) {
      outputArray[keyAsIndex] = obj[key];
    } else {
      // attach it as a property
      outputArray[key] = obj[key];
    }
  });

  return outputArray;
}

function isComparingObjectAndArray(lhs, rhs) {
  var typeLhs = lhs && typeof lhs;
  var typeRhs = rhs && typeof rhs;

  return ((Array.isArray(lhs) && isObject(rhs)) ||
          (Array.isArray(rhs) && isObject(lhs)));
}

function isDate(x) {
  if (!x) {
    return false;
  }

  return Object.prototype.toString.call(x) === '[object Date]';
}

function isObject(x) {
  return typeof x === 'object';
}

function isRegExp(x) {
  return x instanceof RegExp;
}

function isString(x) {
  return typeof x === 'string';
}

function assertTheUnexpected(expect) {
  function AssertionError(err, assertMessage) {
    Error.call(this, '');

    this.name = 'AssertionError';

    if (assertMessage) {
      assertMessage = this.name + ': ' + assertMessage;
    }

    this.stack = (assertMessage ? assertMessage + '\n\n' : '') + err.stack;
    this.message = (assertMessage || '');
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
    } else if (
        (isObject(a) && isObject(b)) &&
        !(isDate(a) && isDate(b)) &&
        !(isRegExp(a) && isRegExp(b)) &&
        !(a === null || b === null)
    ) {
      return {
        a: Object.assign({}, a),
        b: Object.assign({}, b)
      }
    } else if (isComparingObjectAndArray(a, b)) {
      if (Array.isArray(a)) {
        return {
          a: a,
          b: convertObjectToArray(b)
        };
      } else {
        return {
          a: convertObjectToArray(a),
          b: b
        };
      }
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

      if (!comparisonValues && !(isObject(a) || isObject(b))) {
        comparisonValues = prepareEqual(a, b);
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

      if (typeof actual === 'symbol') {
        wrappedExpect('symbol', 'to equal', typeof expected);
      }

      // handle the lastIndex property
      if (actual instanceof RegExp && actual.hasOwnProperty('lastIndex')) {
        wrappedExpect(actual.lastIndex, 'to equal', expected.lastIndex);
      }
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
    notDeepEqual: function notDeepEqual(actual, expected) {
      wrappedExpect(actual, 'not to equal', expected);
    },
    notDeepStrictEqual: function notDeepStrictEqual(actual, expected) {
      wrappedExpect(actual, 'not to equal', expected);
    },
    notStrictEqual: function notStrictEqual(actual, expected) {
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
