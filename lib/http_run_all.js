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
var runId = uuidV4();
var startTimeStamp = new Date().toISOString();
var db = require("../db/dynamoDb");


function runHatkins(res, collectionsToRun) {
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
        res.write("\n.");
        db.putTestResult(testResultConstractor(test));
      }); 
    });
    call.on('end', function() { 
      console.log('Hatkins run completed with run ID: ' + runId);
      resolve();
    });
  });
}

function runFuzzball(res, filter, callback) {
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
        res.write("\n.");
        db.putTestResult(testResultConstractor(test));
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

function testResultConstractor(test) {
  test.runId = runId;
  test.startTimeStamp = startTimeStamp;  
  test = helper.cleanObj(test);
  test.hasOwnProperty('error')? test.passed = 0 : test.passed = 1;
  return test;  
}

function runAllAndReport(res) {
  return Promise.all([runHatkins(res), runFuzzball(res)])
    .then(function() {
      res.write('' + runId);
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).send(error);
    });
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