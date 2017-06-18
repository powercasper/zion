var HTMLBuilder = require('./html_builder');
var config = require('config');

module.exports = {
  mailResults: mailResults
};

function mailResults(results) {
  var api_key = 'key-65618c6ea2e9cb5c108a81976d25663e';
  var domain = 'mail.bypassmobile.com';
  var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

  var html = HTMLBuilder.buildHTML(results.newman, results.fuzzball);

  var emails = [
    'jim@bypassmobile.com',
    'lorne@bypassmobile.com',
    'tracey@bypassmobile.com',
    'jeremy@bypassmobile.com',
    'jross@bypassmobile.com',
    'bharris@bypassmobile.com',
    'kevin@bypassmobile.com',
    'billy@bypassmobile.com',
    'austin@bypassmobile.com',
    'chrism@bypassmobile.com'
  ];

  var data = {
    from: 'Nark: Do Not Reply <nark@mail.bypassmobile.com>',
    to: emails,
    subject: '[' + config.s3Dir + '] Test Results',
    html: html
  };
  if (process.env.SEND_MAIL_ON_FAILURES === true) {
    mailgun.messages().send(data, function (error, body) {
      console.log(body);
    });  
  }
}
