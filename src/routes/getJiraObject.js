import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
import fetch from 'node-fetch'
require('dotenv').config()

const router = express.Router();

router.get('/objectSchemaNametoID', (req, res) => {
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
    uri: process.env.JIRAURL + '/rest/insight/1.0/objectschema/list',
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
    uri: process.env.JIRAURL + '/rest/insight/1.0/objectschema/' + req.query.objectSchemaId + '/objecttypes/flat',
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
    uri: process.env.JIRAURL + '/rest/insight/1.0/iql/objects?objectSchemaId=' + req.query.objectSchemaId + '&iql=ObjectType=' + req.query.objectType + '&resultPerPage=99999',
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
    uri: process.env.JIRAURL + '/rest/insight/1.0/objecttype/' + req.query.objectTypeId + '/objects?start=0&limit=999999',
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

router.get('/object', function (req, res, next) {
  let options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/insight/1.0/object/' + req.query.objectId + '',
    json: true
  }

  rp(options)
    .then(function ($) {
      options.uri = process.env.JIRAURL + '/rest/insight/1.0/object/' + req.query.objectId + '/history'
      rp(options).then((history) => {
        const ret = $
        ret.history = history
        res.status(200).json(ret)
      })
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
              res.status(500).send({ err })
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

router.get('/objectsWithNamesAttributes', async (req, res) => {
  let query = {
    objectSchemaName: req.query.objectSchemaName,
    objectTypeName: req.query.objectTypeName
  }
  let options = {
    uri: process.env.LOCALHOST + '/get/jira/object/objectsWithNames?' + queryString.stringify(query),
    json: true
  }

  let ret = await rp(options)
    .then(($) => {
      return $
    })

  let count = 0
  let objects = await ret.map(async (item) => {
    count++
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        return await resolve(fetch(process.env.LOCALHOST + '/get/jira/object/object?objectId=' + item.id.toString()).then(($) => {
          return $.json()
        }))
      }, 100 * count);
    })
  })

  Promise.all(objects).then((values) => {
    console.log(values)
    let ret = values.map((row) => {
      let item = {
        id: row.id,
        label: row.label
      }
      row.attributes.forEach((attr) => {
        if (attr.objectAttributeValues[0]) {
          item[attr.objectTypeAttribute.name] = attr.objectAttributeValues[0].value || attr.objectAttributeValues[0].referencedObject.label
        }
      })
      return item
    })
    res.json(ret)
  })
})

router.get('/schemaAndTypeId', async (req, res) => {
  let query = {
    name: req.query.objectSchemaName
  }
  let options = {
    uri: process.env.LOCALHOST + '/get/jira/object/objectSchemaNametoID?' + queryString.stringify(query),
    json: true
  }

  const objectSchemaId = await rp(options)
    .then(($) => {
      return $.id.toString()
    })

  query = {
    objectSchemaId,
    name: req.query.objectTypeName
  }
  options = {
    uri: process.env.LOCALHOST + '/get/jira/object/objectTypeNametoID?' + queryString.stringify(query),
    json: true
  }

  const objectTypeId = await rp(options)
    .then(($) => {
      return $.id.toString()
    })

  res.json({ objectSchemaId, objectTypeId })
})

router.get('/objectAttributesMapping', async (req, res) => {
  let query = {
    objectSchemaName: req.query.objectSchemaName,
    objectTypeName: req.query.objectTypeName
  }
  let options = {
    uri: process.env.LOCALHOST + '/get/jira/object/schemaAndTypeId?' + queryString.stringify(query),
    json: true
  }

  const { objectSchemaId, objectTypeId } = await rp(options)
    .then(($) => {
      return $
    })

  options = {
    auth: {
      'user': process.env.JIRAUSER,
      'pass': process.env.JIRAPASS
    },
    uri: process.env.JIRAURL + '/rest/insight/1.0/objecttype/' + objectTypeId + '/attributes',
    json: true
  }

  const ret = await rp(options)
    .then(($) => {
      return $.map((item) => {
        let key = item.name
        let id = item.id
        return { [key]: id }
      })
    })

  let oneJson = {}
  ret.forEach((element) => {
    oneJson[Object.keys(element)[0]] = element[Object.keys(element)[0]]
  })

  res.json(oneJson)

})

router.get('/attributeValue', async (req, res) => {
  let query = {
    objectSchemaName: req.query.objectSchemaName,
    objectTypeName: req.query.objectTypeName
  }
  let options = {
    uri: process.env.LOCALHOST + '/get/jira/object/objectsWithNamesAttributes?' + queryString.stringify(query),
    json: true
  }

  const values = await rp(options)
    .then((objects) => {
      return objects.filter((object) => {
        return object[req.query.findAttribute].toUpperCase() == req.query.findValue.toUpperCase()
      }).map((item) => {
        return item[req.query.returnAttribute]
      })
    })

  res.json(values)
})

router.get('/2attributeValue', async (req, res) => {
  let query = {
    objectSchemaName: req.query.objectSchemaName,
    objectTypeName: req.query.objectTypeName
  }
  let options = {
    uri: process.env.LOCALHOST + '/get/jira/object/objectsWithNamesAttributes?' + queryString.stringify(query),
    json: true
  }

  const values = await rp(options)
    .then((objects) => {
      return objects.filter((object) => {
        return object[req.query.findAttribute].toUpperCase() == req.query.findValue.toUpperCase() && object[req.query.findAttribute2].toUpperCase() == req.query.findValue2.toUpperCase()
      }).map((item) => {
        return item[req.query.returnAttribute]
      })
    })

  res.json(values)
})

router.get('/keyAttributeValue', async (req, res) => {
  let object = await rp({
    uri: process.env.LOCALHOST + '/get/jira/object/object?objectId=' + req.query.Key,
    json: true
  }).then(($) => {
    return $
  })

  let item = {
    id: object.id,
    label: object.label
  }
  object.attributes.forEach((attr) => {
    if (attr.objectAttributeValues[0]) {
      item[attr.objectTypeAttribute.name] = attr.objectAttributeValues[0].value || attr.objectAttributeValues[0].referencedObject.label
    }
  })
  res.json(item[req.query.returnAttribute])
})

router.get('/includeAttributObject', async (req, res) => {
  let query = {
    name: req.query.objectSchemaName
  }
  let options = {
    uri: process.env.LOCALHOST + '/get/jira/object/objectSchemaNametoID?' + queryString.stringify(query),
    json: true
  }

  const objectSchemaId = await rp(options)
    .then((ret) => {
      return ret.id
    })

  query = {
    objectSchemaId: objectSchemaId,
    objectType: req.query.objectTypeName
  }
  options = {
    uri: process.env.LOCALHOST + '/get/jira/object/objectNametoID?' + queryString.stringify(query),
    json: true
  }

  const objects = await rp(options)
    .then((ret) => {
      return ret
    })

  if (objects) {
    console.log(objects.length)
    /*const retjson = objects.filter((entry) => {
      //if (entry[req.query.attribute]) {
        return true//req.query.value.toUpperCase().includes(entry[req.query.attribute].toUpperCase())
      //}
      console.log(retjson)
      if (retjson)
        res.json(retjson)
      else
        res.json({})
    })*/
    let retJson = {}
    objects.forEach((entry) => {
      if (req.query.value.toUpperCase() == entry[req.query.attribute].toUpperCase())
        retJson = [entry]
    })
    res.json(retJson)
  } else {
    res.json({})
  }
})

/*
router.get('/objectAttributesMapping', async (req, res) => {
  let query = {
    objectSchemaName: req.query.objectSchemaName,
    objectTypeName: req.query.objectTypeName
  }
  let options = {
    uri: process.env.LOCALHOST + '/get/jira/object/objectsWithNamesAttributes?' + queryString.stringify(query),
    json: true
  }

  let ret = await rp(options)
    .then(($) => {
      return $.map((attr) => {
        let ret = {}
        ret[attr.Name] = attr.id
        return attr
      })
    })

  let oneJson = {}
  ret.forEach((element) => {
    oneJson[Object.keys(element)[0]] = element[Object.keys(element)[0]]
  })

  res.send(ret)
})
*/
module.exports = router;