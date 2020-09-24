import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
require('dotenv').config()

const router = express.Router();

router.post('/createIssue', function (req, res, next) {
  //console.log(req.body)
  const options = {
    method: 'POST',
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/issue/',
    json: true,
    body: {
      "fields": req.body.createIssue
    }
  }
  //console.log(req.body.createIssue)

  rp(options)
    .then(function ($) {
      res.status(200).json($)
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

const getFieldsIdbyNames = (async (createIssueByName) => {
  const options = {
    uri: process.env.LOCALHOST + '/get/jira/issue/issueFields?projectIdOrKey=AM&issueTypeId=10502',
    json: true,
  }

  return new Promise(async (resolve, reject) => {
    let newJson = {}

    rp(options)
      .then(function ($) {
        Object.keys(createIssueByName).forEach(async (key) => {
          //console.log(key)
          if (key != "project" && key != "issuetype") {
            let retKey = $.filter((sub) => { return sub.name === key })[0].fieldId
            //console.log(retKey)
            newJson[retKey] = createIssueByName[key]
          } else {
            newJson[key] = createIssueByName[key]
          }
          //console.log(newJson)
          if (Object.keys(newJson).length == Object.keys(createIssueByName).length) {
            resolve(newJson)
          }
        })
      })
  })
})

router.post('/createIssueByName', (async (req, res, next) => {
  let newJson = {}
  //console.log(req.body.createIssueByName)

  newJson = await getFieldsIdbyNames(req.body.createIssueByName)

  //console.log(newJson)
  const options = {
    method: 'POST',
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/issue/',
    json: true,
    body: {
      "fields": newJson
    }
  }

  rp(options)
    .then(function ($) {
      res.status(200).json($)
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
}))

router.post('/updateIssue', function (req, res, next) {
  //console.log(req.body)
  const options = {
    method: 'PUT',
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/issue/' + req.body.updateIssue.issueId,
    json: true,
    body: {
      "update": req.body.updateIssue.body,
      fields: req.body.updateIssue.fields
    }
  }
  //console.log(req.body.updateIssue)

  rp(options)
    .then(function ($) {
      res.status(200).json($)
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});


router.get('/setJiraCreator', async (req, res, next) => {
  let options = {
    uri: process.env.LOCALHOST + '/get/jira/issue/issue?issueId=' + req.query.issueId,
    json: true
  }

  const CMDBValue = await rp(options)
    .then(async ($) => {
      if (!$.fields[req.query.from0][req.query.from1]) {
        const options2 = {
          method: 'POST',
          uri: process.env.LOCALHOST + '/get/jira/issue/CustomFieldID',
          body: { name: from1 },//'Creator User Info' },
          json: true
        }
      
        const fromCustomFieldID = await rp(options2)
          .then(($) => {
            return $
          })
        return $.fields[req.query.from0][fromCustomFieldID]
      }
      else
        return $.fields[req.query.from0][req.query.from1]
    })

    console.log(CMDBValue)

  let query = {
    objectSchemaName: req.query.CMDBSchemaName,//'CivilWork',
    objectTypeName: req.query.CMDBObjectTypeName,//'AD_USERS',
    attribute: req.query.CMDBObjectAttributeName,//'Email',
    value: CMDBValue
  }

  options = {
    uri: process.env.LOCALHOST + '/get/jira/object/includeAttributObject?' + queryString.stringify(query),
    json: true
  }

  const objectKey = await rp(options)
    .then(($) => {
      return $[0].Key
    })

  options = {
    method: 'POST',
    uri: process.env.LOCALHOST + '/get/jira/issue/CustomFieldID',
    body: { name: req.query.fieldName },//'Creator User Info' },
    json: true
  }

  const customFieldID = await rp(options)
    .then(($) => {
      return $
    })

  options = {
    method: 'POST',
    uri: process.env.LOCALHOST + '/set/jira/issue/updateIssue',
    body: {
      "updateIssue": {
        "issueId": req.query.issueId,
        "fields": {
          [customFieldID]: [{"key" : objectKey}]
        }
      }
    },
    json: true
  }
res.send(objectKey)
  rp(options).then(($) => {
    return $
  })



})

module.exports = router;