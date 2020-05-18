var express = require('express');
var rp = require('request-promise');
var jira = require('./jira');
var getJiraObject = require('./getJiraObject');
var setJiraObject = require('./setJiraObject');
var getJiraIssue = require('./getJiraIssue');
var setJiraIssue = require('./setJiraIssue');
var sql = require('./sql');
var jiraWebhooks = require('./jiraWebhooks');

var router = express.Router();
router.get('/', function (req, res, next) {
    res.send("1")
})
router.use('/get/jira', jira);
router.use('/get/jira/object', getJiraObject);
router.use('/set/jira/object', setJiraObject);
router.use('/get/jira/issue', getJiraIssue);
router.use('/set/jira/issue', setJiraIssue);
router.use('/sql', sql);
router.use('/jiraWebhooks', jiraWebhooks);

module.exports = router;
