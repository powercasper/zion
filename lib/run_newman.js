var newman = require('newman');
var Promise = require('bluebird');
var postman = require('./postman.js');
var rp = require('request-promise');
var config = require('config');
var envData;

module.exports = {
  runAndReport: runAndReport
};

function runNewman(envData, collection) {
  return new Promise(function(resolve, reject) {
    newman.run({
      collection: collection,
      environment: envData,
      reporters: []
    }, function (err, summary) {
      if (err) { reject(err); }
      resolve(summary);
    });
  });
}

function runAndReport() {
  return runAllCollections();
}

function summaryHasFailures(summary) {
  var hasFailures = false;

  summary.run.failures.forEach(function(failure) {
    hasFailures = true;
  });
  return hasFailures;
}

function runAllCollections() {
  var summaries = [];
  var hasFailures = false;
  return postman.getEnvironment(config.environment)
    .then(function(env) { envData = env.environment; })
    .then(function() { return postman.getCollections(); })
    .then(function(data) {
      var newmanRuns = [];

      // The postman environments have a "Testable Collections" concept. Anything
      // not in the value of this variable will not get run.
      // It expects a comma separated list of collections with no spaces between
      // collection names
      var testableCollections = envData.values.filter(function(val) {
        return val.key === "Testable Collections";
      })[0];

      testableCollections = testableCollections.value.split(",");

      data.forEach(function(collection) {
        var idx = testableCollections.indexOf(collection.collection.info.name);
        if(idx === -1) {
          console.log("skipping ", collection.collection.info.name);

          // If the "Testable Collections" env variable doesn't have
          // this collection, skip it
          return;
        }

        var p = runNewman(envData, collection.collection)
          .then(function(summary) {
            summaries.push(summary);
            return summaryHasFailures(summary);
          })
          .catch(function(err) {
            console.error(err);
          });
        newmanRuns.push(p);
      });

    return Promise.all(newmanRuns);
  })
  .then(function(results){
    if(results.indexOf(true) !== -1) {
      hasFailures = true;
    }

    return {
      summaries: summaries,
      hasFailures: hasFailures
    };
  });
}
