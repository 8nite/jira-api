var express = require('express');
var rp = require('request-promise');
var jira = require('./jira');

var router = express.Router();

router.use('/jira', jira);

module.exports = router;
