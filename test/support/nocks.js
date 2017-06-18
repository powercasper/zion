var nock = require('nock');
var fs = require('fs');

module.exports = {
  nockPostman: nockPostman,
  nockTestableFeature: nockTestableFeature,
  disableNetConnect: disableNetConnect
};

var postmanAPIURL = "https://api.getpostman.com/";
var postmanEnvsData = JSON.parse(fs.readFileSync("test/fixtures/postman/environments.json"));
var postmanTestEnvData = JSON.parse(fs.readFileSync("test/fixtures/postman/test_env.json"));
var postmanCollectionsData = JSON.parse(fs.readFileSync("test/fixtures/postman/collections.json"));
var postmanTestableFeatureCollectionData = JSON.parse(fs.readFileSync("test/fixtures/postman/testable_feature_collection.json"));
var postmanUntestableFeatureCollectionData = JSON.parse(fs.readFileSync("test/fixtures/postman/untestable_feature_collection.json"));

function disableNetConnect() {
  nock.disableNetConnect();
}

function nockPostman() {
  // What the postman script runs
  nock(postmanAPIURL)
    .get("/environments/")
    .reply(200, postmanEnvsData)
    .get("/environments/uid123")
    .reply(200, postmanTestEnvData)
    .get("/collections/")
    .reply(200, postmanCollectionsData)
    .get("/collections/uid456")
    .reply(200, postmanTestableFeatureCollectionData)
    .get("/collections/uid789")
    .reply(200, postmanUntestableFeatureCollectionData);
}

function nockTestableFeature() {
  // What newman hits
  // This matches what's in test/fixtures/postman/test_env.json, the value
  // with key "some_host"
  nock("http://localhost:9938")
    .get("/some_path.json")
    .reply(200);
}
