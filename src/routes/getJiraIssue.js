import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
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
      if (err.response && err.response.body && err.response.body.errorMessages && err.response.body.errorMessages[0] && err.response.body.errorMessages[0].toUpperCase().includes('NOT EXIST')) {
        res.status(501).send(err.response.body.errorMessages[0])
      } else {
        console.log(err)
        res.status(500).send(err)
      }
    })
});

router.get('/issueNames', async function (req, res, next) {
  //console.log(req.body)
  let options = {
    method: 'get',
    uri: process.env.LOCALHOST + '/get/jira/issue/issue?issueId=' + req.query.issueId,
    json: true
  }
  const issue = await rp(options).then((ret) => {
    return ret
  })

  options = {
    method: 'post',
    uri: process.env.LOCALHOST + '/get/jira/issue/allFieldMapping',
    body: {
      fields: issue.fields
    },
    json: true
  }
  const mappedFields = await rp(options).then((ret) => {
    return ret
  })

  let mappedIssue = { ...issue }
  mappedIssue.fields = {}

  Object.keys(issue.fields).forEach((key) => {
    mappedIssue.fields[mappedFields[key]] = issue.fields[key]
  })

  res.json(mappedIssue)
});


router.get('/issueFields', function (req, res, next) {
  //console.log(req.body)
  const options = {
    method: 'GET',
    auth: {
      'username': process.env.JIRAUSER,
      'password': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/issue/createmeta/?projectKeys=' + req.query.projectIdOrKey + '&issuetypeIds=' + req.query.issueTypeId,
    json: true,
  }

  rp(options)
    .then(function ($) {
      res.json($)
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

router.get('/issueScreenFields', function (req, res, next) {
  //console.log(req.body)
  const options = {
    method: 'GET',
    auth: {
      'username': process.env.JIRAUSER,
      'password': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/screens/' + req.query.screenId + '/availableFields',
    json: true,
  }

  rp(options)
    .then(function ($) {
      res.json($)
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
    uri: process.env.JIRAURL + '/rest/api/2/issue/createmeta/?projectKeys=' + req.query.projectIdOrKey,
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
    uri: process.env.JIRAURL + '/rest/api/2/issue/createmeta/?projectKeys=' + req.query.projectIdOrKey,
    json: true
  }

  rp(options)
    .then(function ($) {
      res.status(200).json({ id: $.projects[0].issuetypes.filter((set) => { return set.name === req.query.issueTypeName })[0].id })
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

router.get('/search', function (req, res, next) {
  //console.log(req.body)
  const query = req.query
  const options = {
    method: 'GET',
    auth: {
      'username': process.env.JIRAUSER,
      'password': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/search?' + queryString.stringify(query),
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

router.post('/allFieldMapping', async (req, res) => {
  const options = {
    uri: process.env.LOCALHOST + '/get/jira/issue/allFields',
    json: true
  }
  let newMapping = {}
  rp(options).then((json) => {
    Object.keys(req.body.fields).forEach((fieldName) => {
      if (req.body.fields[fieldName] || req.body.showHidden) {
        let assign = json.filter((field) => {
          return field.id == fieldName
        })[0].name
        //console.log(assign)
        newMapping[fieldName] = assign
      }
    })
    res.send(newMapping)
  })
})

router.post('/allFieldMappingAllRev', async (req, res) => {
  const options = {
    uri: process.env.LOCALHOST + '/get/jira/issue/allFields',
    json: true
  }
  let newMapping = {}
  rp(options).then((json) => {
    json.map((item) => {
      return { [item.name]: item.id }
    }).forEach((element) => {
      newMapping[Object.keys(element)[0]] = element[Object.keys(element)[0]]
    })
    res.send(newMapping)
  })
})

router.post('/CustomFieldID', async (req, res) => {
  const options = {
    uri: process.env.LOCALHOST + '/get/jira/issue/allFields',
    json: true
  }
  rp(options).then((json) => {
    res.send(json.filter((row) => {
      //console.log(req.body)
      return row.name === req.body.name
    })[0].id)
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