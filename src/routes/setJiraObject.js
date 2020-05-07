import express from 'express'
import rp from 'request-promise'

const router = express.Router();

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
  
    const options = {
      method: 'POST',
      auth: {
        'user': process.env.JIRAUSER,
        'pass': process.env.JIRAPASS
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
        res.status(500).send(err)
      })
  });
  
  const createObjectTypeAttribute = (async (objectType, name, type, defaultTypeId) => {
    return new Promise(async (resolve, reject) => {
      const options = {
        method: 'POST',
        auth: {
          'user': process.env.JIRAUSER,
          'pass': process.env.JIRAPASS
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
    const options = {
      method: 'POST',
      auth: {
        'user': process.env.JIRAUSER,
        'pass': process.env.JIRAPASS
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
        res.status(500).send(err)
      })
  });
  
  router.get('/1createObjectType', function (req, res, next) {
    const options = {
      method: 'POST',
      auth: {
        'user': process.env.JIRAUSER,
        'pass': process.env.JIRAPASS
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
        res.status(500).send(err)
      })
  });
  
  router.get('/0createObjectSchema', function (req, res, next) {
    const options = {
      method: 'POST',
      auth: {
        'user': process.env.JIRAUSER,
        'pass': process.env.JIRAPASS
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
        res.status(500).send(err)
      })
  });

  module.exports = router;