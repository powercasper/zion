'use strict';
var PostmanKey = "277298d5978d4a07a226365a1696575f";
var rp = require('request-promise');
var config = require('config');

var postmanEnvironmentsURL = "https://api.getpostman.com/environments/";
var postmanCollectionsURL = "https://api.getpostman.com/collections/";

module.exports = {
  getCollections: getCollections,
  getEnvironment: getEnvironment,
  // Exposed for testing purposes -_-
  // _config: config,
};

function requestOptions(uri) {
  var postmanHeaders = {
    'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001',
    'X-API-KEY'   : PostmanKey
  };

  return {
    uri    : uri,
    headers: postmanHeaders,
    json   : true,
    timeout: 30000 // 5 minutes
  };
}

function getEnvironment() {
  var envReqOpts = requestOptions(postmanEnvironmentsURL);
  /* This request returns the following:
   * {
   *     "environments": [
   *         {
   *             "id": "43fe36b0-f7b0-21e5-873f-243e7ae7d7b8",
   *             "name": "Integration",
   *             "owner": "1153291",
   *             "uid": "1153291-43fe36b0-f7b0-21e5-873f-243e7ae7d7b8"
   *         },
   *         {
   *             "id": "69e172ac-3b8f-0256-4a7c-ee2f7decc022",
   *             "name": "Production",
   *             "owner": "1153291",
   *             "uid": "1153291-69e172ac-3b8f-0256-4a7c-ee2f7decc022"
   *         }
   *     ]
   * }
   */

  return rp(envReqOpts)
    .then(function (envs) {
      var reqP;

      envs.environments.forEach(function (envMeta) {
        var reqOpts;
        if (envMeta.name.toLowerCase() === config.environment) {
          reqOpts = requestOptions(postmanEnvironmentsURL + envMeta.uid);
          reqP = rp(reqOpts);
        }
      });

      if (reqP === undefined) {
        var availableEnvs = envs.environments.map(function (envMeta) {
          return envMeta.name;
        });

        console.error("Could not determine the environment to run for Newman. Please check that you're specifying the correct one\nAvailable Environments: ", availableEnvs, "\nRequested Environment: ", config.environment);

        throw("Could not determine the environment to run for Newman");
      }

      return reqP;
    }).then(function(envData) {
      return replaceURLs(envData);
    });
}

/*
 * This function, unfortunately, closely ties Nark to the postman environment
 * data. If any of the postman environment variable names change, it will
 * require a Nark deploy to match them.
 */
function replaceURLs(envData) {
  envData.environment.values.forEach(function(val) {
    switch(val.key) {
      case 'api_host':
        val.value = config.apiServerURL;
        break;
      case 'auth_host':
        val.value = config.authServerURL;
        break;
      case 'flippy_host':
        val.value = config.featureFlipURL;
        break;
      case 'sv_gateway_host':
        val.value = config.storedValueGatewayURL;
        break;
      case 'licensing_host':
        val.value = config.licensingURL;
        break;
      case 'standsheets_host':
        val.value = config.standsheetsURL;
        break;
      case 'bucks_host':
        val.value = config.bucksURL;
        break;
      case 'kaiser_host':
        val.value = config.kaiserURL;
        break;
      case 'zuul_host':
        val.value = config.zuulURL;
        break;
      case 'bypasslane_host':
        val.value = config.snowflakeURL;
        break;
    }
  });
  return envData;
}

function getCollections() {
  var opts = requestOptions(postmanCollectionsURL);

  return rp(opts).then(function (collectionData) {
    var collections = collectionData.collections;
    var collectionFetchPromises = [];

    collections.forEach(function (col) {
      var colReqOpts = requestOptions(postmanCollectionsURL + col.uid);
      collectionFetchPromises.push(rp(colReqOpts));
    });

    return Promise.all(collectionFetchPromises);
  });
}
