import express from 'express'
import rp from 'request-promise'
require('dotenv').config()

const router = express.Router();

router.post('/createIssue', function (req, res, next) {
  console.log(req.body)
  const options = {
    method: 'POST',
    auth: {
      'username': 'tnssapi',
      'password': process.env.JIRAPASS
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/api/2/issue/',
    json: true,
    body: {
      "fields": req.body.createIssue
    }
  }
  console.log(req.body.createIssue)

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
            let retKey = $.filter((sub) => {return sub.name === key})[0].fieldId
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
      'username': 'tnssapi',
      'password': process.env.JIRAPASS
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/api/2/issue/',
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
  console.log(req.body)
  const options = {
    method: 'PUT',
    auth: {
      'username': 'tnssapi',
      'password': process.env.JIRAPASS
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/api/2/issue/' + req.body.updateIssue.issueId,
    json: true,
    body: {
      "update": req.body.updateIssue.body
    }
  }
  console.log(req.body.updateIssue)

  rp(options)
    .then(function ($) {
      res.status(200).json($)
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

module.exports = router;