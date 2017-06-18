var assert = require('chai').assert;
var newmanRunner = require('../lib/run_newman');
var nocks = require('./support/nocks');

// Do _not_ allow external connections
nocks.disableNetConnect();

suite('runNewman', function() {
  test('returns only one summary', function(done) {
    nocks.nockPostman();
    nocks.nockTestableFeature();

    newmanRunner.runAndReport()
      .then(function(resp) {
        assert.lengthOf(resp.summaries, 1, "contains one summary");
      })
      .finally(done);
  });

  test('indicates if there were failures', function(done) {
    nocks.nockPostman();

    // by not nocking newman, newman will return an
    // error and we'll see that we've had failures
    newmanRunner.runAndReport()
      .then(function(resp) {
        assert.isTrue(resp.hasFailures);
      })
      .finally(done);
  });

  test('indicates if no failures happened', function(done) {
    nocks.nockPostman();
    nocks.nockTestableFeature();

    newmanRunner.runAndReport()
      .then(function(resp) {
        assert.isFalse(resp.hasFailures);
      })
      .finally(done);
  });
});
