var PROTO_PATH = 'protobuf/run_and_report.proto';
var grpc = require('grpc');
var async = require('async');
var config = require('config');
var zion_messaging_proto = grpc.load(PROTO_PATH).zion_messaging;
var helper = require('./helper');
var uuidV4 = require('uuid/v4');
var argv = require('yargs').argv;
var llPort = 4901;
var mlPort = 4902;
var uiPort = 4903;
var db = require("../db/dynamoDb");
var startTimeStamp;


function RunLowLevel(callback, runId, collectionsToRun) {

  console.log('running low level tests');
  console.log('runId', runId);
  // return new Promise(function(resolve, reject) {  

  // });
}

function testResultConstructor(test, runId) {
  test.runId = runId;
  test.startTimeStamp = startTimeStamp;  
  test = helper.cleanObj(test);
  test.hasOwnProperty('error')? test.passed = 0 : test.passed = 1;
  return test;  
}

// function runAllAndReport(ws) {
//   var runId = uuidV4();
//   startTimeStamp = new Date().toISOString();
//   return Promise.all([RunLowLevel(ws, runId), runFuzzball(ws, runId)])
//     .then(function() {
//       ws.send(JSON.stringify({runId: runId}));
//       ws.send("Completed");
//     })
//     .catch(function (err) {
//       console.log(err);
//       var error = {
//         status: 500,
//         error: err
//       }
//       ws.send(JSON.stringify(error));
//     });
// }

function sendTestResultAndPutToDB (test, ws, runId) {
  test = testResultConstructor(test, runId);
  ws.send(JSON.stringify(test));
  db.putTestResult(test);
}

function main() {
  async.series([
    RunLowLevel
  ]);
}

if (require.main === module) {
  main();
}

exports.runLowLevel = RunLowLevel;