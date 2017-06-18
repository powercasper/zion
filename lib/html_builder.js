var Mustache = require('mustache');
var fs = require('fs');

module.exports = {
  buildHTML: buildHTML
};

function buildHTML(newmanResponse, fuzzballResponse) {
  var template = fs.readFileSync("html/mail.template.html", 'utf8');
  var view = {
    newman: newmanResponse,
    fuzzball: fuzzballResponse
  };
  return Mustache.render(template, view);
}
