var AssertionError = require('assert').AssertionError;

function assignObject(target, source) {
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }

  return target;
}

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

function convertObjectToLooseObject(obj) {
  obj = assignObject({}, obj);
  var currentObject;
  var visitNext = [obj];

  while (visitNext.length > 0) {
    currentObject = visitNext.shift();

    Object.keys(currentObject).forEach(function (key) {
      var currentValue = currentObject[key];

      if (typeof currentValue === 'object' && currentValue) {
        visitNext.push(currentValue);
      } else {
        currentObject[key] = String(currentValue);
      }
    });
  }

  return obj;
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

function isNumber(x) {
  return !isNaN(Number(x));
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

    this.stack = err.stack && err.stack.replace(this.message, assertMessage);
    this.message = assertMessage;
  }

  UnexpectedAssertError.prototype = Object.create(AssertionError.prototype);

  function createWrappedExpect(localExpect) {
    return function wrappedExpect() {
      var args = Array.prototype.slice.apply(arguments);
      // convert UnexpectedError to AssertionError
      try {
        return localExpect.apply(localExpect, args);
      } catch (err) {
        throw new UnexpectedAssertError(err);
      }
    };
  }

  var expectWithLooseEquality = expect.clone();

  expectWithLooseEquality.addAssertion('<any> [not] to loosely be <any>', function (expect, subject, expected) {
    var comarisonValues = prepareEqual(subject, expected);
    var a = comarisonValues.a;
    var b = comarisonValues.b;

    expect(a, '[not] to be', b);
  });

  expectWithLooseEquality.addAssertion('<any> [not] to loosely equal <any>', function (expect, subject, expected) {
    var a = subject;
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

    expect(a, '[not] to equal', b);
  });

  var wrappedExpect = createWrappedExpect(expectWithLooseEquality);

  function checkIfError(value) {
    try {
      expect(value, 'to be falsy');
    } catch (e) {
      throw value;
    }
  }

  function checkNotThrow(block, errorConstraint, message) {
    function checkError(blockError) {
      var outputMessage = 'Got unwanted exception.';
      var outputMessageSuffix = '.';

      if (isRegExp(errorConstraint)) {
        try {
          expect(blockError, 'to have message', errorConstraint);
        } catch (e) {
          if (!isString(message)) {
            throw blockError;
          }

          outputMessageSuffix = ' ' + message;

          throw new UnexpectedAssertError(blockError, {
            message: outputMessage + outputMessageSuffix
          });
        }
      }

      if (errorConstraint) {
        /*
         * Check whether the unexpected exception satisfied
         * the constraint that was supplied.
         */

        try {
          expect(blockError, 'not to be a', errorConstraint);
        } catch (e) {
          // it was satisfied so throw an AssertionError
          throw new UnexpectedAssertError(blockError);
        }

        if (!isString(errorConstraint)) {
          // it was not satisfied so throw the orignal error
          throw blockError;
        }
      }

      if (isString(errorConstraint)) {
        outputMessageSuffix = ' ' + errorConstraint;
      }

      // notify an eception was seen in the absence of a constraint
      throw new UnexpectedAssertError(blockError, {
        message: outputMessage + outputMessageSuffix
      });
    }

    try {
      expect(function () {
        block();
      }, 'not to error');
    } catch (e) {
      checkError(e.originalError);
    }
  }

  function checkThrows(block, errorConstraint, message) {
    function checkError(blockError) {
      if (isRegExp(blockError)) {
        throw blockError;
      }

      if (errorConstraint) {
        try {
          expect(blockError, 'to be a', errorConstraint);
        } catch (e) {
          // XXX must be a specific check against true
          //     This avoids constructors that happen to succeed
          //     retuning and being misinterpreted.
          try {
            expect(errorConstraint(blockError), 'to be true');
          } catch (e2) {
            throw blockError;
          }
        }
      }
    }

    var checkToError;
    var outputMessageSuffix;

    if (isRegExp(errorConstraint)) {
      checkToError = errorConstraint;

      // in this case a user defined messagee may be the next arg
      outputMessageSuffix = message;
    } else {
      checkToError = function (e) {
        checkError(e);

        return true;
      };

      // the message is the second argument if it exists
      outputMessageSuffix = errorConstraint;
    }

    try {
      expect(function () {
        block();
      }, 'to error', checkToError);
    } catch (e) {
      if (e.originalError) {
        // unpack an unexpected error
        e = e.originalError;

        // throw original error on regex mismatch
        if (isRegExp(errorConstraint)) {
          throw e;
        }
      } else if (e.name !== 'UnexpectedError') {
        // throw any errors that do not arise from "to error"
        throw e;
      }

      var outputMessage = 'Missing expected exception.';

      if (isString(outputMessageSuffix)) {
        outputMessage += ' ' + outputMessageSuffix;
      } else {
        outputMessage += '.';
      }

      // no error was seen despite it being expected
      throw new UnexpectedAssertError(e, {
        message: outputMessage
      });
    }
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
        a: convertObjectToLooseObject(a),
        b: convertObjectToLooseObject(b)
      }
    }

    return null;
  }

  function prepareEqual(actual, expected) {
    var a = actual;
    var b = expected;

    if (isString(a) && isString(b)) {
      return {
        a: a,
        b: b
      };
    }

    if ((isNumber(a) || isNumber(b)) && (isString(a) || isString(b))) {
      return {
        a: String(a),
        b: String(b)
      };
    }

    return {
      a: !!a,
      b: !!b
    };
  }

  return assignObject(function (value) {
    checkTruthy(value);
  }, {
    AssertionError: UnexpectedAssertError,
    deepEqual: function deepEqual(actual, expected) {
      wrappedExpect(actual, 'to loosely equal', expected);

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
    doesNotThrow: function (block, expected, message) {
      checkNotThrow(block, expected, message);
    },
    equal: function equal(actual, expected) {
      wrappedExpect(actual, 'to loosely be', expected);
    },
    ifError: function ifError(value) {
      checkIfError(value);
    },
    notEqual: function notEqual(actual, expected) {
      wrappedExpect(actual, 'not to loosely be', expected);
    },
    notDeepEqual: function notDeepEqual(actual, expected) {
      wrappedExpect(actual, 'not to loosely equal', expected);
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
    throws: function (block, expected, message) {
      checkThrows(block, expected, message);
    }
  });
}

module.exports = assertTheUnexpected(require('unexpected'));
