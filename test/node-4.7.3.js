var semver = require('semver');

describe('node', function () {
  function itByVersion(version, description, block) {
    var isMinimumVersion = semver.gte(process.version, version);

    if (isMinimumVersion) {
      return it(description, block);
    } else {
      return it.skip(description, block);
    }
  }

  itByVersion('4.0.0', 'should pass node 4.7.3 tests', function () {
    require('./node/node-4.7.3');
  });
});
