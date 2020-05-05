var express = require('express');
var rp = require('request-promise');

var router = express.Router();

router.get('/objectSchemaNametoID', function (req, res, next) {
  var options = {
    auth: {
      'user': 'herbert',
      'pass': 'qwer1234'
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/objectschema/list',
    json: true
  }

  rp(options)
    .then(function ($) {
      let ret = null
      try {
        ret = $.objectschemas.filter((item) => { return item.name === req.query.name })[0].id
      }
      catch { }
      res.status(200).json({ id: ret })
    })
    .catch(function (err) {
      console.log(err)
      res.send({})
    })
});

router.get('/objectSchemaKeytoID', function (req, res, next) {
  var options = {
    auth: {
      'user': 'herbert',
      'pass': 'qwer1234'
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/objectschema/list',
    json: true
  }

  rp(options)
    .then(function ($) {
      let ret = null
      try {
        ret = $.objectschemas.filter((item) => { return item.objectSchemaKey === req.query.key })[0].id
      }
      catch { }
      res.status(200).json({ id: ret })
    })
    .catch(function (err) {
      console.log(err)
      res.send({})
    })
});

router.get('/objectTypeNametoID', function (req, res, next) {
  var options = {
    auth: {
      'user': 'herbert',
      'pass': 'qwer1234'
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/objectschema/' + req.query.objectSchemaId + '/objecttypes/flat',
    json: true
  }

  rp(options)
    .then(function ($) {
      let ret = null
      try {
        ret = $.filter((entry) => { return entry.name === req.query.name })[0].id
      }
      catch { }
      res.status(200).json({ id: ret })
    })
    .catch(function (err) {
      console.log(err)
      res.send({})
    })
});

router.get('/objectNametoID', function (req, res, next) {
  var options = {
    auth: {
      'user': 'herbert',
      'pass': 'qwer1234'
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/iql/objects?objectSchemaId=' + req.query.objectSchemaId + '&iql=ObjectType=' + req.query.objectType + '&resultPerPage=999',
    json: true
  }

  rp(options)
    .then(function ($) {
      let mappedArray = []
      let map = {}
      $.objectTypeAttributes.forEach((attribute) => {
        map[attribute.name] = attribute.id
      })
      $.objectEntries.forEach((entry) => {
        let item = {}
        Object.keys(map).forEach((key) => {
          let innerValue = entry.attributes.filter((attribute) => { return attribute.objectTypeAttributeId === map[key] })
          item[key] = null
          if (innerValue.length > 0 && innerValue[0].objectAttributeValues && innerValue[0].objectAttributeValues.length > 0 && innerValue[0].objectAttributeValues[0].value) {
            item[key] = innerValue[0].objectAttributeValues[0].value
          }
        })
        mappedArray.push(item)
      })

      res.status(200).json(mappedArray)
    })
    .catch(function (err) {
      console.log(err)
      res.send({})
    })
});

module.exports = router;