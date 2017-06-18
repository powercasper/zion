var http = require('http');
var express = require('express');
var path = require('path');
var argv = require('yargs').argv; 
var config = require('config');
var cors = require('cors');
var timeout = require('connect-timeout');
var bodyParser = require('body-parser');
var runner = require('./lib/run_all.js');
var uuidV4 = require('uuid/v4');

var app = express();
var port = parseInt(config.port, 10); //default 4001
var ipaddress = '0.0.0.0';

var server = http.createServer(app);

server.listen(port, ipaddress, function () {
  console.log('Server Listening on port: ', port);
  outputConfigLog();
});

app.use(cors());
app.use(timeout('600s'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/status', require('./routes/status'));

/**
 * @example curl 'http://localhost:4001/run_hatkins?filter=bucks,items'
 * can run hatkins exclusively providing collections want to be run. 
 */
app.use('/run_ll', function(req, res) {
  var runId = uuidV4();
  runner.runLowLevel(res, runId)
  console.log('running LOW_LEVEL');
});

/**
 * @example curl 'http://localhost:4001/run_fuzzball'
 * can run fuzzball exclusively. will run all fuzzball tests.
 */
app.use('/run_ml', function(req, res) {
  var runId = uuidV4();
  console.log('running MEDIUM_LEVEL');
});

/**
 * curl 'http://localhost:4001/run_all_tests'
 * will run all tests and save results to DynamoDB. 
 * hatkins will run postman Testable collections
 */
app.use('/run_ui', function(req, res) {
  console.log('running ui');
  // runner.runAllAndReport(res);
});


function outputConfigLog() {
  console.log('Configured as:');
  console.log('\tCONNECTED_ON_PORT \t: ' +  config.port);
  console.log('\tLOW_LEVEL_RUNNER \t: ' +  config.llRunner);
  console.log('\tMEDIUM_LEVEL_RUNNER \t: ' +  config.mlRunner);
  console.log('\tUI_LEVEL_RUNNER \t: ' +  config.uiRunner);
  console.log('\tEnvironment \t: ' +  config.environment);
}