var testRunner = require('../lib/run_all');
var router = require('express').Router();

router.post("/", function(req, res) {
  // Close the connection right away
  res.send({ status: "running" });

  // Run the requested tests
  testRunner.runTestsAndReport();
});

module.exports = router;
