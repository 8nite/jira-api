import express from 'express'
import 'babel-polyfill'
import rp from 'request-promise'
import queryString from 'query-string'
import flatten from 'safe-flat'
import { Parser } from 'json2csv'
require('dotenv').config()

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
    uri: process.env.JIRAURL + '/rest/insight/1.0/object/create',
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
      uri: process.env.JIRAURL + '/rest/insight/1.0/objecttypeattribute/' + objectType,
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
    uri: process.env.JIRAURL + '/rest/insight/1.0/objecttype/create',
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
    uri: process.env.JIRAURL + '/rest/insight/1.0/objecttype/create',
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
    uri: process.env.JIRAURL + '/rest/insight/1.0/objectschema/create',
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


router.get('/getOBjectinType', function (req, res, next) {
  const options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/insight/1.0/iql/objects?objectSchemaId=' + req.query.objectSchemaId + '&iql=ObjectType=' + req.query.ObjectType + '&resultPerPage=10',
    json: true
  }

  rp(options)
    .then(function ($) {
      //console.log($)
      res.send($)
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
});


router.get('/objectschema/list', function (req, res, next) {
  const options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/insight/1.0/objectschema/list',
    json: true
  }

  rp(options)
    .then(function ($) {
      console.log($)
      res.send($)
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

router.get('/workflow/list', function (req, res, next) {
  const options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/3/field',
    //uri: process.env.JIRAURL + '/rest/projectconfig/1/workflow?workflowName=TOC%20Change%20request%20AW&projectKey=TP',
    //uri: process.env.JIRAURL + '/rest/projectconfig/latest/workflowscheme/TP',
    json: true
  }

  rp(options)
    .then(function ($) {
      console.log($)
      res.send($)
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

router.get('/discrepancy', async (req, res, next) => {
  const sqlColName = req.query.colName
  const CMDBSchema = req.query.CMDBSchema
  const CMDBType = req.query.CMDBType
  const CMDBColName = req.query.colName
  //Get SQL data
  let query = {
    user: req.query.user,
    password: req.query.password,
    connString: req.query.connString,
    tableName: req.query.tableName,
  }
  let options = {
    method: 'GET',
    uri: process.env.LOCALHOST + '/sql/getTableData?' + queryString.stringify(query),
    json: true,
  }

  let sqlData = await rp(options).then(($) => {
    return $.rows
  })

  //Get Jira SchemaID
  query = {
    objectSchemaName: CMDBSchema,
    objectTypeName: CMDBType
  }
  options = {
    uri: process.env.LOCALHOST + '/get/jira/object/objectsWithNamesAttributes?' + queryString.stringify(query),
    json: true,
  }

  let CMDB = await rp(options).then(($) => {
    return $
  })

  // find discrepancy
  let discrepancy = {
    add: sqlData.filter((item) => { return (!CMDB.map((sub) => { return sub[sqlColName] }).includes(item[sqlColName])) })
  }
  discrepancy.remove = CMDB.filter((item) => {
    return (!sqlData.map((sqlEach) => { return sqlEach[sqlColName] }).includes(item[sqlColName]))
  })

  const update = sqlData.filter((item) => {
    return (CMDB.map((sub) => { return sub[sqlColName] }).includes(item[sqlColName]))
  }).filter((item) => {
    return CMDB.every((CMDBrow) => {
      if (CMDBrow[sqlColName] == item[sqlColName]) {
        return Object.keys(item).some((key) => {
          return !item[key] || CMDBrow[key] != item[key]
        })
      }
      else {
        return true
      }
    })
  })

  discrepancy.remove = discrepancy.remove.concat(update.map((row) => {
    return CMDB.filter((CMDBrow) => {
      return CMDBrow[sqlColName] == row[sqlColName]
    })[0]
  }))


  discrepancy.add = discrepancy.add.concat(update)

  res.json({
    ...discrepancy
  })
})

router.get('/ExportCSVreport', function (req, res, next) {
  const options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/api/2/search?jql=project=' + req.query.projectKey + '&maxResults=1000&',
    json: true
  }

  rp(options)
    .then(($) => {
      //res.send($.issues.map((issue) => { return issue.key }))
      let issues = $.issues.map((issue) => {
        let issueOptions = {
          uri: process.env.LOCALHOST + '/get/jira/issue/issueNames?issueId=' + issue.key,
          json: true,
        }
        return rp(issueOptions).then((ret) => {
          return {
            key: ret.key,
            ...flatten(ret.fields)
          }
        })
      })
      Promise.all(issues).then((issuesRet) => {
        console.log(issuesRet)
        //res.send(issuesRet)
        //transform into csv
        const parser = new Parser(Object.keys(issuesRet));
        res.send(parser.parse(issuesRet))
      })
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err)
    })
});

module.exports = router;