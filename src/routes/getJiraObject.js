import express from 'express'
import rp from 'request-promise'
require('dotenv').config()

const router = express.Router();

router.get('/objectSchemaNametoID', function (req, res, next) {
  const options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
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
      res.status(500).send(err)
    })
});

router.get('/objectSchemaKeytoID', function (req, res, next) {
  const options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
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
      res.status(500).send(err)
    })
});

router.get('/objectTypeNametoID', function (req, res, next) {
  const options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
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
      res.status(500).send(err)
    })
});

router.get('/objectNametoID', function (req, res, next) {
  const options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
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
      res.status(500).send(err)
    })
});

router.get('/objects', function (req, res, next) {
  const options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/objecttype/' + req.query.objectTypeId + '/objects',
    json: true
  }

  rp(options)
    .then(function ($) {
      res.status(200).json($.map((row) => { return row.label }))
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

router.get('/objectsWithNames', function (req, res, next) {
  let options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.LOCALHOST + '/get/jira/object/objectSchemaNametoID?name=' + req.query.objectSchemaName,
    json: true
  }

  rp(options)
    .then(function ($) {
      const objectSchemaId = $.id
      options.uri = process.env.LOCALHOST + '/get/jira/object/objectTypeNametoID?objectSchemaId=' + objectSchemaId + '&name=' + req.query.objectTypeName
      rp(options)
        .then(($) => {
          const objectTypeId = $.id
          options.uri = process.env.LOCALHOST + '/get/jira/object/objects?objectTypeId=' + objectTypeId 
          rp(options)
            .then(($) => {
              res.status(200).json($)
            })
            .catch(function (err) {
              console.log(err)
              res.status(500).send({err})
            })
        })
        .catch(function (err) {
          console.log(err)
          res.status(500).send(err)
        })
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

module.exports = router;