var rp = require('request-promise');
var config = require('config');

module.exports = {
  runAndReport: runAndReport
};

function runAndReport() {
  var uri = config.bpPageObjURL;
  var requestOpts = {
    method: 'POST',
    uri: uri + "/run_tests",
    json: true,
    timeout: 30000, // 5 minutes
    forever: true
  };

  return rp(requestOpts).then(function (resp) {
    return {
      summary: resp
    };
  });
}
