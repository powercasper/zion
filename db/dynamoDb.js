var AWS = require("aws-sdk");
var fs = require("fs");
var config = require('config');
var tableName = config.awsTableName;

AWS.config.update({
  region: config.awsRegion
});

var dynamodb = new AWS.DynamoDB();

module.exports = {
  dbCreateTable: dbCreateTable,
  dbCheckTableStatus: dbCheckTableStatus,
  dbDeleteTable: dbDeleteTable,
  putTestResult: putTestResult,
  getTestResult: getTestResult,
  delTestResult: delTestResult,
  queryWithRunId: queryWithRunId 
};

function dbCreateTable() {
  var params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: "run_id", KeyType: "HASH"},  //Partition key
      { AttributeName: "test_id", KeyType: "RANGE" }  //Sort key  
    ],
    AttributeDefinitions: [       
        { AttributeName: "run_id", AttributeType: "S" },
        { AttributeName: "test_id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
  }

  dynamodb.createTable(params, function(err, data) {
      if (err) console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  });
}

function dbCheckTableStatus(callback) {
  status="false";
  var params = {
      TableName: tableName /* required */
  };

  dynamodb.describeTable(params, function(err, data) {
    if (err) {
        status = "false";
        console.log(err, err.stack); // an error occurred
    }
    else {
        status = ("true");
    }
    callback(status);
  });
}

function dbDeleteTable() {
  checkRegionUpdate();

  var params = {
    TableName : tableName
  };

  dynamodb.deleteTable(params, function(err, data) {
      if (err) console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
  });
}

function putTestResult(loadData) {
  var docClient = new AWS.DynamoDB.DocumentClient();

  var params = {
      TableName:tableName,
      Item: loadData
  };

  docClient.put(params, function(err, data) {
      if (err) console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
  });
}

function getTestResult (params) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName: tableName,
      Key: params
  };

  docClient.get(params, function(err, data) {
      if (err) console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2))
      else console.log(JSON.stringify(data, null, 2))
  });
}

function delTestResult (params) {
  var docClient = new AWS.DynamoDB.DocumentClient();

  var params = {
      TableName:tableName,
      Key: params
  };

  docClient.delete(params, function(err, data) {
      if (err) console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
  });
}

function queryWithRunId (runId) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName : tableName,
      KeyConditionExpression: "#runId = :runId",
      ExpressionAttributeNames:{
          "#runId": "runId"
      },
      ExpressionAttributeValues: {
          ":runId": runId
      }
  };

  docClient.query(params, function(err, data) {
    if (err) console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
  });
}

function checkRegionUpdate() {
  if(!AWS.config.region) {
    AWS.config.update({
      region: config.awsRegion,
      endpoint: config.awsEndpoint
    });  
  }
}

exports.checkTable = function checkTable(callback) {
    status="false";
    console.log("Check table: " + tableName);
    var params = {
        TableName: tableName /* required */
    };
    dynamodb.describeTable(params, function(err, data) {
        if (err) {
          status="false";
          console.log(err, err.stack); // an error occurred
        }
        else {
          status=("true");
        }
        callback(status);
    });
}


