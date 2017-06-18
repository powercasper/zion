var dataDogApplicationKey = "bb446896a6b718cf602d76ea2e7fe848e5ab3e7e";
var dataDogAPIKey = "6542fcc96e58ccd4232546440a4f0c5a";
var config = require('config');

var rp = require('request-promise');

module.exports = {
  postRunEvent: postRunEvent
};

function postRunEvent(opts) {
  var runText = generateRunText(opts);
  var alertType = opts.succeeded ? "success" : "error";
  var requestOpts = {
    uri: "https://app.datadoghq.com/api/v1/events",
    method: 'POST',
    qs: {
      api_key: dataDogAPIKey,
      application_key: dataDogApplicationKey
    },
    body: {
      title: "Nark Run",
      text: runText,
      alert_type: alertType,
      tags: ["environment:"+config.environment, "collection:"+opts.collectionName]
    },
    json: true
  };

  return rp(requestOpts)
    .then(function(resp) {
      console.log("DataDog Response");
      console.log(resp);
    });
}

function generateRunText(opts) {
  var runText = "";
  var succeeded = opts.succeeded;
  if(succeeded) {
    runText += "Nark ran successfully";
  } else {
    runText += "Nark ran into some errors";
  }
  
  var hasS3Url = !!(opts && opts.s3URL);

  // var _runText =      "\n\n s3URL: -->  "   + opts.s3URL + 
  //                     "\n testName: -->  "  + opts.testName + 
  //                     "\n testID: -->  "    + opts.id + 
  //                     "\n url: -->  "       + opts.url;
  // var errorRunText =  "\n errorName: -->  " + opts.errorName + 
  //                     "\n message: -->  " + opts.message + 
  //                     "\n requestError: -->  " + opts.requestError + 
  //                     "\n Stack: -->  " + opts.stack;

  // runText += "\n\n" + (!hasS3Url ? "No S3 url" : succeeded? _runText : (_runText + errorRunText));
  var _runText =  "\n\n succeeded: --> " + opts.succeeded + "\n\n s3URL: -->  "   + opts.s3URL; 
  runText += "\n\n" + (!hasS3Url ? "No S3 url" : _runText);
  return runText;
}


/**
 *  url, response body, status, failure message and stack
 *  
 */