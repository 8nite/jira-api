import express from 'express'
import rp from 'request-promise'
require('dotenv').config()

const router = express.Router();

router.get('/issue', function (req, res, next) {
  //console.log(req.body)
  const options = {
    method: 'GET',
    auth: {
      'username': process.env.JIRAUSER,
      'password': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/issue/' + req.query.issueId,
    json: true,
  }

  rp(options)
    .then(function ($) {
      res.status(200).json($)
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

router.get('/issueFields', function (req, res, next) {
  //console.log(req.body)
  const options = {
    method: 'GET',
    auth: {
      'username': process.env.JIRAUSER,
      'password': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/issue/createmeta/' + req.query.projectIdOrKey + '/issuetypes/' + req.query.issueTypeId,
    json: true,
  }

  rp(options)
    .then(function ($) {
      let ret = []
      $.values.forEach((item) => {
        let ele = {
          name: item.name,
          fieldId: item.fieldId
        }
        if (item.allowedValues && Array.isArray(item.allowedValues) && item.allowedValues.length > 0) {
          ele.allowedValues = item.allowedValues
        }
        ret.push(ele)
      })
      res.status(200).json(ret)
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

router.get('/issueTypes', function (req, res, next) {
  //console.log(req.body)
  const options = {
    method: 'GET',
    auth: {
      'username': process.env.JIRAUSER,
      'password': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/issue/createmeta/' + req.query.projectIdOrKey + '/issuetypes',
    json: true
  }

  rp(options)
    .then(function ($) {
      res.status(200).json($)
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

router.get('/issueTypeNametoId', function (req, res, next) {
  //console.log(req.body)
  const options = {
    method: 'GET',
    auth: {
      'username': process.env.JIRAUSER,
      'password': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/issue/createmeta/' + req.query.projectIdOrKey + '/issuetypes',
    json: true
  }

  rp(options)
    .then(function ($) {
      res.status(200).json({ id: $.values.filter((set) => { return set.name === req.query.issueTypeName })[0].id })
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

router.get('/allFields', function (req, res, next) {
  //console.log(req.body)
  const options = {
    method: 'GET',
    auth: {
      'username': process.env.JIRAUSER,
      'password': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/field',
    json: true
  }

  rp(options)
    .then(function ($) {
      res.status(200).json($.sort(GetSortOrder()))
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

router.post('/allFieldMapping', async (req, res) => {
  const options = {
    uri: process.env.LOCALHOST + '/get/jira/issue/allFields',
    json: true
  }
  let newMapping = {}
  rp(options).then((json) => {
    Object.keys(req.body.fields).forEach((fieldName) => {
      if (req.body.fields[fieldName]) {
        let assign = json.filter((field) => {
          return field.id == fieldName
        })[0].name
        console.log(assign)
        newMapping[fieldName] = assign
      }
    })
    res.send(newMapping)
  })
})

function GetSortOrder(prop) {
  return function (a, b) {
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }
}

module.exports = router;