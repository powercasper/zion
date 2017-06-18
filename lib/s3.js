var AWS = require('aws-sdk');
var time = require('time');
var config = require('config');

var s3 = new AWS.S3();

module.exports = {
  uploadToS3: uploadToS3,
  _s3Params: s3Params,
};

function s3Params(object, options) {
  var params = {
    Bucket: 'bypass-medium-test-runs'
  };

  var date = new time.Date().setTimezone("America/Chicago");
  params.Body = JSON.stringify(object, null, 2);
  var dateString = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + pad('00', date.getDate(), true);
  var directory = config.s3Dir;
  params.Key = "nark_runs/" + directory + "/" + dateString + "/" + date.getHours() + "." + date.getMinutes()  + "." + date.getSeconds() + "." + date.getMilliseconds();

  if(object.hadFailures()){
    params.Key += ".withFailures.json";
  } else {
    params.Key += ".allPassed.json";
  }
  return params;
}

function uploadToS3(object, options) {
  return new Promise(function(resolve, reject) {
    var params = s3Params(object, options);

    s3.putObject(params, function(err, data) {
      if(err) {
        console.error(err);
        reject(err);
      } else {
        console.log("put to s3 with key: ", params.Key);
        resolve("https://s3.amazonaws.com/" + params.Bucket + "/" + params.Key);
      }
    });
  }).catch(function(err) {
    console.log("Error with s3");
    console.log(err);
    console.log(err.stack);
  });
}

// Used to pad numbers so we can get '03' instead of just '3'
function pad(pad, str, padLeft) {
  if (typeof str === 'undefined') 
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}
