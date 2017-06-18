var db = require("../db//dynamoDb");
module.exports = {
  cleanObj: cleanObj,
  removeDuplicates: removeDuplicates,
  postDataToDB: postDataToDB
}

function cleanObj(testResultObj) {
  Object.keys(testResultObj).map(function(prop) {
    if(testResultObj[prop] === "") delete testResultObj[prop]; 
  });
  return testResultObj;
}

function removeDuplicates(originalArray, prop) {
  var i, newArray = [], lookupObject  = {};
  for(i in originalArray) lookupObject[originalArray[i][prop]] = originalArray[i];
  for(i in lookupObject) newArray.push(lookupObject[i]);
  return newArray;
 }

 function postDataToDB(call, runId, startTimeStamp) {
  call.on('data', function(response) {
    response.tests.map(function(test) {  
      test.startTimeStamp = startTimeStamp;
      test = cleanObj(test);
      test.runId = runId;
      test.hasOwnProperty('error')? test.passed = 0 : test.passed = 1;
      db.putTestResult(test);
    });
  });
}