import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
import moment from 'moment'
require('dotenv').config()

const router = express.Router();

router.get('/AssetManagementObjectCreatedEvent', async (req, res, next) => {
    console.log(req.query)

    if (!req.query.type || req.query.type != 'CPE Type') {
        res.send('')
        return
    }

    let options = {
        uri: process.env.LOCALHOST + '/get/jira/object/object?objectId=' + req.query.Key,
        json: true
    }
    rp(options).then(($) => {
        const tableName = 'DSBS.JIRA_CPE_TYPE'
        const JIRA_ID = req.query.Key
        const CPE_TYPE = $.name
        const CREATEDBY = $.history[$.history.length - 1].actor.name
        const CREATEDDATE = moment(new Date($.created)).format('YYYY-MM-DD HH:MM:SS')
        const UPDATEDBY = $.history[0].actor.name
        const UPDATEDDATE = moment(new Date($.updated)).format('YYYY-MM-DD HH:MM:SS')
        const values = [JIRA_ID, CPE_TYPE, CREATEDBY, CREATEDDATE, UPDATEDBY, UPDATEDDATE]
        console.log(values)

        options.uri = process.env.LOCALHOST + '/sql/insertSQL'
        options.method = 'POST'
        options.body = {
            sql: {
                tableName,
                values
            }
        }
        rp(options).then(($) => {
            console.log($)
        })
    })

    res.send('')
})

router.get('/AssetManagementObjectUpdatetedEvent', async (req, res, next) => {
    console.log(req.query)

    if (!req.query.type || req.query.type != 'CPE Type') {
        res.send('')
        return
    }

    let options = {
        uri: process.env.LOCALHOST + '/get/jira/object/object?objectId=' + req.query.Key,
        json: true
    }
    rp(options).then(($) => {
        const tableName = 'DSBS.JIRA_CPE_TYPE'
        const JIRA_ID = req.query.Key
        const CPE_TYPE = $.name
        const CREATEDBY = $.history[$.history.length - 1].actor.name
        const CREATEDDATE = moment(new Date($.created)).format('YYYY-MM-DD HH:MM:SS')
        const UPDATEDBY = $.history[0].actor.name
        const UPDATEDDATE = moment(new Date($.updated)).format('YYYY-MM-DD HH:MM:SS')
        const values = [JIRA_ID, CPE_TYPE, CREATEDBY, CREATEDDATE, UPDATEDBY, UPDATEDDATE]
        console.log(values)

        options.uri = process.env.LOCALHOST + '/sql/insertSQL'
        options.method = 'POST'
        options.body = {
            sql: {
                tableName,
                values
            }
        }
        rp(options)

        options.uri = process.env.LOCALHOST + '/sql/updateSQL'
        options.method = 'POST'
        options.body = {
            sql: {
                tableName,
                find: { JIRA_ID },
                values: {
                    CPE_TYPE, CREATEDBY, CREATEDDATE, UPDATEDBY, UPDATEDDATE
                }
            }
        }
        rp(options)
    })

    res.send('')
})

router.get('/AssetManagementObjectDeletedEvent', async (req, res, next) => {
    console.log(req.query)

    if (!req.query.type || req.query.type != 'CPE Type') {
        res.send('')
        return
    }

    let options = {
        uri: process.env.LOCALHOST + '/sql/deleteSQL',
        json: true
    }
    const tableName = 'DSBS.JIRA_CPE_TYPE'
    const JIRA_ID = req.query.Key
    options.method = 'POST'
    options.body = {
        tableName,
        find: { JIRA_ID }
    }
    rp(options).then(($) => {
        console.log($)
    })
    res.send('')
})

router.get('/AssetManagementObjectMovedEvent', async (req, res, next) => {
    console.log(req.query)
    const options = {
        uri: process.env.LOCALHOST + '/jiraWebhooks/AssetManagementObjectCreatedEvent?' + queryString.stringify(req.query),
        json: true
    }
    rp(options)
    res.send('')
})

module.exports = router;