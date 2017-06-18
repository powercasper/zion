module.exports = {
  llRunner: process.env.LOW_LEVEL_RUNNER || "http://localhost:4901/",
  mlRunner: process.env.MEDIUM_LEVEL_RUNNER || "http://localhost:4902/",
  uiRunner: process.env.UI_LEVEL_RUNNER || "http://localhost:4903/",
  awsEndpoint: process.env.AWS_ENDPOINT || "http://localhost:8000",
  awsRegion: process.env.AWS_REGION || "us-east-1",
  awsTableName: process.env.AWS_TABLE_NAME || "main_runner",
  environment:  'development',
  port: 4900,
  send_mail: 0 
};
