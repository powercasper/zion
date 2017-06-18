var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var postman = require('../lib/postman');
var nocks = require('./support/nocks');
var config = require('config');

var config = require('config');

chai.use(chaiAsPromised);
var assert = chai.assert;

// Do _not_ allow external connections
nocks.disableNetConnect();

suite('postman', function() {
  setup(function() {
    nocks.nockPostman();
  });

  suite('getCollections', function() {
    test('returns a fulfilled promise', function() {
      return assert.isFulfilled(postman.getCollections());
    });

    test('fetches a list of all collections', function() {
      // Returns _all_ collections
      return assert.eventually.lengthOf(postman.getCollections(), 2, 'collections');
    });
  });

  suite('getEnvironment', function() {
    test('returns a fulfilled promise', function() {
      return assert.isFulfilled(postman.getEnvironment());
    });

    test('fetches the environment data', function() {
      return assert.eventually.property(postman.getEnvironment(), 'environment');
    });

    suite('with a bad environment', function() {
      var oldEnv;
      setup(function() {
        oldEnv = config.environment;
        config.environment = 'nonexistent';
      });

      teardown(function() {
        config.environment = oldEnv;
      });

      test("throws an error if it can't find the requested environment", function() {
        return assert.isRejected(postman.getEnvironment());
      });
    });
  });

  suite('uses config URLs', function() {
    var envData;

    setup(function() {
      return postman.getEnvironment()
        .then(function(env) {
          envData = env.environment;
        });
    });

    var findValue = function(key) {
      var val = envData.values.find(function(v) {
        return v.key === key;
      });

      if(!val) {
        throw("Could not find value for key: " + key);
      }

      return val;
    };

    test("replaces the api server url", function() {
      var apiURLValue = findValue("api_host");
      return assert.equal(apiURLValue.value, config.apiServerURL);
    });

    test("replaces the auth server url", function() {
      var authURLValue = findValue("auth_host");
      return assert.equal(authURLValue.value, config.authServerURL);
    });

    test("replaces the feature flip url", function() {
      var featureFlipURLValue = findValue('flippy_host');
      return assert.equal(featureFlipURLValue.value, config.featureFlipURL);
    });

    test("replaces the stored value gateway url", function() {
      var storedValueGatewayValue = findValue('sv_gateway_host');
      return assert.equal(storedValueGatewayValue.value, config.storedValueGatewayURL);
    });

    test("replaces the licensing server url", function() {
      var licensingValue = findValue('licensing_host');
      return assert.equal(licensingValue.value, config.licensingURL);
    });

    test("replaces the standsheets server url", function() {
      var standsheetsValue = findValue('standsheets_host');
      return assert.equal(standsheetsValue.value, config.standsheetsURL);
    });

    test("replaces the bucks server url", function() {
      var bucksValue = findValue('bucks_host');
      return assert.equal(bucksValue.value, config.bucksURL);
    });

    test("replaces the kaiser server url", function() {
      var kaiserValue = findValue('kaiser_host');
      return assert.equal(kaiserValue.value, config.kaiserURL);
    });

    test("replaces the zuul server url", function() {
      var zuulValue = findValue('zuul_host');
      return assert.equal(zuulValue.value, config.zuulURL);
    });

    test("replaces the snowflake server url", function() {
      var snowflakeValue = findValue('bypasslane_host');
      return assert.equal(snowflakeValue.value, config.snowflakeURL);
    });
  });
});
