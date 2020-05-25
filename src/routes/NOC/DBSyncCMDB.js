import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
require('dotenv').config()

const router = express.Router();

router.get('/', async (req, res, next) => {
    //Get SQL data
    let query = {
        user: 'atoms',
        password: 'atoms',
        connectString: '172.25.14.57:1526/ATOMSP1',
        tableName: 'ATOMS.TEMP_NOC_MONITOR_JIRA',
        CMDBSchema: 'TOC',
        CMDBType: 'TEMP_NOC_MONITOR_JIRA',
        colName: 'CIRC_NO'
    }
    let options = {
        method: 'GET',
        uri: process.env.LOCALHOST + '/get/jira/discrepancy?' + queryString.stringify(query),
        json: true,
    }

    let discrepancy = await rp(options).then(($) => {
        return $
    })

    res.json(discrepancy)

    //remove
    await asyncForEach(discrepancy.remove, async (remove) => {
        let query1 = {
            id: remove.id
        }
        let options1 = {
            method: 'GET',
            uri: process.env.LOCALHOST + '/set/jira/object/deleteObject?' + queryString.stringify(query1),
            json: true,
        }
        await rp(options1)
    })

    //add
    await asyncForEach(discrepancy.add, async (add) => {
        options = {
            method: 'POST',
            uri: process.env.LOCALHOST + '/set/jira/object/objectCreateSimple',
            json: true,
            body: {
                add: {
                    objectSchemaName: query.CMDBSchema,
                    objectTypeName: query.CMDBType,
                    values: [add]
                }
            }
        }

        const result = await rp(options)
            .then(($) => {
                return $
            })

        console.log(result)
    })
})

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

module.exports = router;