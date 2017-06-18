var gulp = require('gulp');
var llRunner = require('./lib/llRunner');
var mlRunner = require('./lib/mlRunner');
var uiRunner = require('./lib/uiRunner');

gulp.task('default', ['llRunner', 'mlRunner', 'uiRunner']);

gulp.task('llRunner', function() {
  llRunner
    .runAndReport()
    .then(function(result) {
      console.log(printResult(result));
    })
});

gulp.task('mlRunner', function() {
  mlRunner
    .runAndReport()
    .then(function(result) {
      console.log(printResult(result));
    });
});

gulp.task('uiRunner', function() {
  uiRunner
    .runAndReport()
    .then(function(result) {
      console.log(printResult(result));
    })
});

function printResult(data) {
  return JSON.stringify(data, null, 2);
}
