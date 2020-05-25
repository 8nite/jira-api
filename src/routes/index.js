import express from 'express'
import jira from './jira'
import getJiraObject from './getJiraObject'
import setJiraObject from './setJiraObject'
import getJiraIssue from './getJiraIssue'
import setJiraIssue from './setJiraIssue'
import sql from './sql'
import jiraWebhooks from './jiraWebhooks'
import TNSSDBSyncCMDB from './TNSS/DBSyncCMDB'
import NOCDBSyncCMDB from './NOC/DBSyncCMDB'

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

router.use('/TNSS/DBSyncCMDB', TNSSDBSyncCMDB);
router.use('/NOC/DBSyncCMDB', NOCDBSyncCMDB);

module.exports = router;
