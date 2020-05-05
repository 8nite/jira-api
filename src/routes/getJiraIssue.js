var express = require('express');
var rp = require('request-promise');

var router = express.Router();

router.get('/issueFields', function (req, res, next) {
  //console.log(req.body)
  var options = {
    method: 'GET',
    auth: {
      'username': 'tnssapi',
      'password': 'qwer1234'
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/api/2/issue/createmeta/' + req.query.projectIdOrKey + '/issuetypes/' + req.query.issueTypeId,
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
      res.status(202).send(err)
    })
});

router.get('/issueTypes', function (req, res, next) {
  //console.log(req.body)
  var options = {
    method: 'GET',
    auth: {
      'username': 'tnssapi',
      'password': 'qwer1234'
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/api/2/issue/createmeta/' + req.query.projectIdOrKey + '/issuetypes',
    json: true
  }

  rp(options)
    .then(function ($) {
      res.status(200).json($)
    })
    .catch(function (err) {
      console.log(err)
      res.status(202).send(err)
    })
});

router.get('/issueTypeNametoId', function (req, res, next) {
  //console.log(req.body)
  var options = {
    method: 'GET',
    auth: {
      'username': 'tnssapi',
      'password': 'qwer1234'
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/api/2/issue/createmeta/' + req.query.projectIdOrKey + '/issuetypes',
    json: true
  }

  rp(options)
    .then(function ($) {
      res.status(200).json({ id: $.values.filter((set) => { return set.name === req.query.issueTypeName})[0].id })
    })
    .catch(function (err) {
      console.log(err)
      res.status(202).send(err)
    })
});

module.exports = router;