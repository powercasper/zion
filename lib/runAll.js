var PROTO_PATH ='./node_modules/nark_messaging/protobuf/run_and_report.proto';
var grpc = require('grpc');
var async = require('async');
var config = require('config');
var nark_messaging_proto = grpc.load(PROTO_PATH).nark_messaging;
var helper = require('./helper');
var uuidV4 = require('uuid/v4');
var argv = require('yargs').argv;
var portHatkins = 4005;
var portFuzzball = 4000;
var portLemur = 4044;
var db = require("../db//dynamoDb");
var startTimeStamp;


function runHatkins(ws, runId, collectionsToRun) {
  return new Promise(function(resolve, reject) {
    console.log('Running Hatkins on ....  ' + config.hatkinsURL + ':' + portHatkins);

    if(argv.filter !== undefined) collectionsToRun = argv.filter;
    var hatkinsClient = new nark_messaging_proto.RunAndReport(config.hatkinsURL + ':' + portHatkins,
                                        grpc.credentials.createInsecure());
    
    var reqObj = {
      collections: collectionsToRun || '',
      env: config.environment  
    }
    var call = hatkinsClient.runTests(reqObj);
    call.on('data', function(response) { 
      response.tests.map(function(test) {
        sendTestResultAndPutToDB (test, ws, runId);
      }); 
    });
    call.on('end', function() { 
      console.log('Hatkins run completed with run ID: ' + runId);
      resolve();
    });
  });
}

function runFuzzball(ws, runId, filter) {
  return new Promise(function(resolve, reject) {
    console.log('Running Fuzzball on .....' + config.fuzzballURL + ':' + portFuzzball);
    var fuzzballClient = new nark_messaging_proto.RunAndReport(config.fuzzballURL + ':' + portFuzzball,
                                        grpc.credentials.createInsecure());
    var reqObj = {
      filter: filter,
      exclude: undefined   
    }

    var call = fuzzballClient.runTests(reqObj);
    call.on('data', function(response) { 
      response.tests.map(function(test) {
        sendTestResultAndPutToDB (test, ws, runId);
      }); 
    });
    call.on('end', function() { 
      console.log('Fuzzball run completed with run ID: ' + runId);
      resolve();
    });
  });
}

function runLemur() {
  console.log('Running Lemur.....');
  var user;
  var client = new nark_messaging_proto.RunAndReport(config.lemurURL + ':' + portLemur,
                                       grpc.credentials.createInsecure());
  var call = client.runTests({});
  helper.postDataToDB(call, runId, startTimeStamp);
}

function testResultConstructor(test, runId) {
  test.runId = runId;
  test.startTimeStamp = startTimeStamp;  
  test = helper.cleanObj(test);
  test.hasOwnProperty('error')? test.passed = 0 : test.passed = 1;
  return test;  
}

function runAllAndReport(ws) {
  var runId = uuidV4();
  startTimeStamp = new Date().toISOString();
  return Promise.all([runHatkins(ws, runId), runFuzzball(ws, runId)])
    .then(function() {
      ws.send(JSON.stringify({runId: runId}));
      ws.send("Completed");
    })
    .catch(function (err) {
      console.log(err);
      var error = {
        status: 500,
        error: err
      }
      ws.send(JSON.stringify(error));
    });
}

function sendTestResultAndPutToDB (test, ws, runId) {
  test = testResultConstructor(test, runId);
  ws.send(JSON.stringify(test));
  db.putTestResult(test);
}

function main() {
  async.series([
    runHatkins, runFuzzball, runLemur
  ]);
}

if (require.main === module) {
  main();
}

exports.runHatkins = runHatkins;
exports.runFuzzball = runFuzzball;
exports.runLemur = runLemur;
exports.runAllAndReport = runAllAndReport;