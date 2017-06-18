var assert = require('chai').assert;
var HTMLBuilder = require('../lib/html_builder');
var fs = require('fs');

suite('HTMLBuilder', function(){
  suite('buildHTML', function(){
    test('returns an HTML body', function(){
      var newmanJSON = JSON.parse(fs.readFileSync("test/fixtures/postman_test_run_response.json"));
      var fuzzballJSON = JSON.parse(fs.readFileSync("test/fixtures/fuzzball_test_run_response.json"));

      var expectedOutput = fs.readFileSync("test/fixtures/html_output.html", 'utf-8');
      var HTMLPage = HTMLBuilder.buildHTML(newmanJSON, fuzzballJSON);

      assert.strictEqual(expectedOutput, HTMLPage);
    });
  });
});
