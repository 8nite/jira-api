var express = require('express');
var rp = require('request-promise');

var router = express.Router();

router.post('/4objectCreate', function (req, res, next) {
    let attributes = []
    console.log(req.body)
    Object.keys(req.body.passObjects[0]).forEach((key) => {
      attributes.push({
        "objectTypeAttributeId": key,
        "objectAttributeValues": [{
          "value": req.body.passObjects[0][key]
        }]
      })
    })
  
    var options = {
      method: 'POST',
      auth: {
        'user': 'herbert',
        'pass': 'qwer1234'
      },
      uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/object/create',
      json: true,
      body: {
        "objectTypeId": req.body.objectTypeId,
        attributes
      }
    }
  
    rp(options)
      .then(function ($) {
        console.log($)
        res.send($)
      })
      .catch(function (err) {
        console.log(err.message)
        res.send(err)
      })
  });
  
  const createObjectTypeAttribute = (async (objectType, name, type, defaultTypeId) => {
    return new Promise(async (resolve, reject) => {
      var options = {
        method: 'POST',
        auth: {
          'user': 'herbert',
          'pass': 'qwer1234'
        },
        uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/objecttypeattribute/' + objectType,
        json: true,
        body: {
          "name": name,
          "type": type,
          "defaultTypeId": defaultTypeId,
          "additionalValue": ""
        }
      }
  
      rp(options)
        .then(function ($) {
          console.log($)
          resolve($)
        })
        .catch(function (err) {
          resolve(err)
        })
    })
  })
  
  router.get('/3createObjectTypeAttribute', function (req, res, next) {
    createObjectTypeAttribute(req.query.objectType, req.query.name, req.query.type, req.query.defaultTypeId)
  });
  
  router.get('/2createObjectTypeInnerCustomer', function (req, res, next) {
    var options = {
      method: 'POST',
      auth: {
        'user': 'herbert',
        'pass': 'qwer1234'
      },
      uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/objecttype/create',
      json: true,
      body: {
        "name": req.query.name,
        "description": req.query.description,
        "iconId": req.query.iconId,                //The icon id
        "parentObjectTypeId": req.query.parentObjectTypeId,     //The parent object type id
        "objectSchemaId": req.query.objectSchemaId           //The Object Schema id
      }
    }
  
    rp(options)
      .then(function ($) {
        console.log($)
        res.send($)
      })
      .catch(function (err) {
        res.send(err)
      })
  });
  
  router.get('/1createObjectTypeCustomer', function (req, res, next) {
    var options = {
      method: 'POST',
      auth: {
        'user': 'herbert',
        'pass': 'qwer1234'
      },
      uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/objecttype/create',
      json: true,
      body: {
        "name": req.query.name,
        "description": req.query.description,
        "iconId": req.query.iconId,                //The icon id
        "parentObjectTypeId": req.query.parentObjectTypeId,     //The parent object type id
        "objectSchemaId": req.query.objectSchemaId           //The Object Schema id
      }
    }
  
    rp(options)
      .then(function ($) {
        console.log($)
        res.send($)
      })
      .catch(function (err) {
        res.send(err)
      })
  });
  
  router.get('/0createObjectSchema', function (req, res, next) {
    var options = {
      method: 'POST',
      auth: {
        'user': 'herbert',
        'pass': 'qwer1234'
      },
      uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/objectschema/create',
      json: true,
      body: {
        "name": req.query.name,
        "objectSchemaKey": req.query.objectSchemaKey,
        "description": req.query.description
      }
    }
  
    rp(options)
      .then(function ($) {
        console.log($)
        res.send($)
      })
      .catch(function (err) {
        res.send(err)
      })
  });
  
  
  router.get('/getOBjectinType', function (req, res, next) {
    var options = {
      auth: {
        'user': 'herbert',
        'pass': 'qwer1234'
      },
      uri: 'https://jirasd-dev.hgc.com.hk/rest/insight/1.0/iql/objects?objectSchemaId=' + req.query.objectSchemaId + '&iql=ObjectType=' + req.query.ObjectType + '&resultPerPage=10',
      json: true
    }
  
    rp(options)
      .then(function ($) {
        console.log($)
        res.send($)
      })
      .catch(function (err) {
        res.send(err)
      })
  });
  
  
  router.get('/objectschema/list', function (req, res, next) {
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
        console.log($)
        res.send($)
      })
      .catch(function (err) {
        res.send(err)
      })
  });

  module.exports = router;