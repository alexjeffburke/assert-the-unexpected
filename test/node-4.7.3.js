var semver = require('semver');

describe('node', function () {
  function itByVersion(range, description, block) {
    var isMinimumVersion = semver.satisfies(process.version, range);

    if (isMinimumVersion) {
      return it(description, block);
    } else {
      return it.skip(description, block);
    }
  }

  itByVersion('<=6', 'should pass node 4.7.3 tests', function () {
    require('./node/node-4.7.3');
  });
});
