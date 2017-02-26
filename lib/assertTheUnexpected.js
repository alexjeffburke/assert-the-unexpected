var AssertionError = require('assert').AssertionError;

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

function isArguments(x) {
  return Object.prototype.toString.call(x) === '[object Arguments]';
}

function isArrayOrArguments(x) {
  return Array.isArray(x) || isArguments(x);
}

function isComparingObjectAndArray(lhs, rhs) {
  var typeLhs = lhs && typeof lhs;
  var typeRhs = rhs && typeof rhs;

  return ((isArrayOrArguments(lhs) && isObject(rhs)) ||
          (isArrayOrArguments(rhs) && isObject(lhs)));
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
  function UnexpectedAssertError(err, options) {
    if (!(this instanceof UnexpectedAssertError)) {
      return null;
    }
    AssertionError.call(this, '');
    err = err || {};
    options = options || {};

    var assertMessage = (options.message || err.message);

    this.stack = this.name + ': ' + assertMessage + '\n\n' + (err.stack || '');
    this.message = assertMessage;
  }

  UnexpectedAssertError.prototype = Object.create(AssertionError.prototype);

  function createWrappedExpect(localExpect) {
    return function wrappedExpect() {
      var args = Array.prototype.slice.apply(arguments);
      // convert UnexpectedError to AssertionError
      try {
        localExpect.apply(localExpect, args);
      } catch (err) {
        throw new UnexpectedAssertError(err);
      }
    };
  }

  var wrappedExpect = createWrappedExpect(expect);

  function catchErrorAndThrowOriginal(block) {
    try {
      block();
   } catch (e) {
      if (e.originalError) {
        throw e.originalError;
      } else {
        throw new UnexpectedAssertError(e, {
          message: 'Missing expected exception..'
        });
      }
    }
  }

  function checkNotThrow(block, errorConstraint) {
    try {
      expect(function () {
        block();
      }, 'not to error');
    } catch (e) {
      var blockError = e.originalError;

      try {
        expect(blockError, 'not to be a', errorConstraint);
      } catch (e2) {
        throw new UnexpectedAssertError(blockError);
      }

      throw blockError;
    }
  }

  function checkThrows(block, errorConstraint) {
    function checkError(blockError) {
      if (isRegExp(errorConstraint)) {
        expect(blockError, 'to have message', errorConstraint).catch(function () {
          throw new UnexpectedAssertError(blockError);
        });
      } else {
        try {
          expect(blockError, 'to be a', errorConstraint);
        } catch (e) {
          expect(errorConstraint(blockError), 'to be truthy').catch(function () {
            throw blockError;
          });
        }
      }
    }

    catchErrorAndThrowOriginal(function () {
      expect(function () {
        block();
      }, 'to error', function (blockError) {
        if (errorConstraint) {
          checkError(blockError);
        }
      });
    });
  }

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
    } else if (isComparingObjectAndArray(a, b)) {
      if (isArguments(a) || isArguments(b)) {
        return {
          a: a,
          b: b
        };
      }

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
    AssertionError: UnexpectedAssertError,
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
    doesNotThrow: function (block, expected) {
      checkNotThrow(block, expected);
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
      wrappedExpect(actual, 'not to be', expected);
    },
    ok: function (value) {
      checkTruthy(value);
    },
    strictEqual: function strictEqual(actual, expected) {
      wrappedExpect(actual, 'to be', expected);
    },
    throws: function (block, expected) {
      checkThrows(block, expected);
    }
  });
}

module.exports = assertTheUnexpected(require('unexpected'));
