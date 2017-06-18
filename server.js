// newrelic, sentry
// require('newrelic');
// var Raven = require('raven');
// Raven.config('https://4dd9978539334a20a2678fdc353cafb5:91b5f12b02f346fdbcfb5a0b9bf64ed9@sentry.io/169236').install();

var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var argv = require('yargs').argv; 
var config = require('config');
var runner = require('./lib/runAll.js');
var uuidV4 = require('uuid/v4');
var WebSocket = require('ws');
var db = require("./db/dynamoDb");

var app = express();
var port = parseInt(config.port, 10); //default 4900
var ipaddress = '0.0.0.0';

var server = http.createServer(app);
var wss = new WebSocket.Server({ server });

function heartbeat() {
  this.isAlive = true;
}
// function dbTableStatusCheck(stat) {    
//   if(stat === "false") {
//     console.error('DynamoDb Table Status is Not ACTIVE !!!! Check db!');
//     ws.close();
//   } else {
//     console.log('DynamoDb Table Status is ACTIVE');
//     server.close(function() {
//       console.log('cannot establish database connection');
//     });        
//     throw new Error('cannot establish database connection');
//   }
// }

// db.dbCheckTableStatus(dbTableStatusCheck);

wss.on('connection', function connection(ws, req) {
  console.log('ws connected');
  ws.send('connected');
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  // Might use location.query.access_token to authenticate or share sessions 
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312) 

  ws.on('message', function incoming(message) {
    var message = JSON.parse(message);
    if (message.do === 'run_all') {
      console.log('running tests.....');
      runner.runAllAndReport(ws);
    }
  });
  ws.on('close', function close() {
    console.log('disconnected');
  });
});

var interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping('', false, true);
  });
}, 30000);

server.listen(4900, function listening() {
  outputConfigLog();
  console.log('Listening on %d', server.address().port);
});

function outputConfigLog() {
  console.log('Configured as:');
  console.log('\tCONNECTED_ON_PORT \t: ' +  config.port);
  console.log('\tLOW_LEVEL_RUNNER \t: ' +  config.llRunner);
  console.log('\tMEDIUM_LEVEL_RUNNER \t: ' +  config.mlRunner);
  console.log('\tUI_LEVEL_RUNNER \t: ' +  config.uiRunner);
  console.log('\tEnvironment \t: ' +  config.environment);
}
