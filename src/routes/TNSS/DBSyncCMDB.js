import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
require('dotenv').config()

const router = express.Router();

router.get('/', async (req, res, next) => {
    //Get SQL data
    let query = {
        user: 'dsbs',
        password: 'abc123',
        connString: '172.25.15.138:1521/fbiu',
        tableName: 'DSBS.JIRA_ABC_TEST_SYNC',
        CMDBSchema: 'Asset Management',
        CMDBType: 'ABC_TEST_SYNC',
        colName: 'NAME'
    }
    let options = {
        method: 'GET',
        uri: process.env.LOCALHOST + '/get/jira/discrepancy?' + queryString.stringify(query),
        json: true,
    }

    let discrepancy = await rp(options).then(($) => {
        return $
    })

    //remove
    discrepancy.remove.forEach((remove) => {
        let query1 = {
            id: remove.id
        }
        let options1 = {
            method: 'GET',
            uri: process.env.LOCALHOST + '/set/jira/object/deleteObject?' + queryString.stringify(query1),
            json: true,
        }
        rp(options1)
    })

    //add
    discrepancy.add.forEach((add) => {
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

        const result = rp(options)
            .then(($) => {
                return $
            })

        console.log(result)
    })

    res.json(discrepancy)
})

module.exports = router;