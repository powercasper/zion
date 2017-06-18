var rp = require('request-promise');
var config = require('config');

module.exports = {
  runAndReport: runAndReport
};

function runAndReport() {
  var uri = config.fuzzballURL;

  var requestOpts = {
    uri: uri + "/run_specs/standsheets",
    qs: {
      exclude: true
    },
    json: true,
    timeout: 30000, // 5 minutes
    forever: true
  };

  return rp(requestOpts).then(function(resp) {
    var hasFailures = false;

    if(resp.failures.length > 0) {
      hasFailures = true;
    }

    return {
      summary: resp,
      hasFailures: hasFailures
    };
  });
}
