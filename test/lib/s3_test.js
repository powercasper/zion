var chai = require("chai");
var s3 = require("../../lib/s3");
var assert = chai.assert;

suite('s3', function() {
  suite('s3 key', function() {
    var optionsObject = {
      environment: 'test'
    };

    var object = {
      hadFailures: function() { return false; }
    };

    test('returns a unique s3 key on each invocation', function() {
      // There's enough time between these two calls that a few
      // milliseconds pass. That's all we need to make the Key
      // unique enough for our tests and for the actual report files
      var initialKey = s3._s3Params(object, optionsObject).Key;
      var secondKey = s3._s3Params(object, optionsObject).Key;
      assert.notEqual(initialKey, secondKey);
    });
  });
});
