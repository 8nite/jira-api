import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
import momenttz from 'moment-timezone'
import { Base64 } from 'js-base64'

require('dotenv').config()

const router = express.Router();

router.post('/gotEmail', async (req, res, next) => {
    console.log(req.body.info)
    //check if issue key exist
    let ret = {}

    let issueKey = null
    let cuzInd = null
    try {
        issueKey = req.body.info.subject.match(/\[(IBVSD-[0-9]+)([a-zA-Z][a-zA-Z])\]/)[1]
        cuzInd = req.body.info.subject.match(/\[(IBVSD-[0-9]+)([a-zA-Z][a-zA-Z])\]/)[2]
    } catch { }
    console.log('issueKey: ' + issueKey + ", cuzInd:" + cuzInd)

    let emailFields = req.body.info
    emailFields.body = Base64.decode(emailFields.body)
    if (emailFields.body) {
        //emailFields.body = Buffer.from(emailFields.body.replace(/[^\x20-\x7E][!@#$%^&*()]/g, '')).toString('base64')
        emailFields.body = '<meta charset="utf-8" />' + emailFields.body 
        emailFields.body = Base64.encode(emailFields.body)
    }

    let query = {
        issueId: issueKey
    }
    let options = {
        method: 'GET',
        uri: process.env.LOCALHOST + '/get/jira/issue/issue?' + queryString.stringify(query),
        json: true,
    }

    if (issueKey) {
        if (cuzInd.toUpperCase() === 'CU') {
            emailFields = {
                CustomerFrom: emailFields.from,
                CustomerTo: emailFields.to,
                CustomerCc: emailFields.cc,
                CustomerSubject: emailFields.subject,
                CustomerBody: emailFields.body,
                CustomerAttachment: JSON.stringify(emailFields.attachments),
            }
            emailFields = bodyMassage(emailFields, req.body.info.to)
        } else if (cuzInd.toUpperCase() === 'CA') {
            emailFields = {
                CarrierFrom: emailFields.from,
                CarrierTo: emailFields.to,
                CarrierCc: emailFields.cc,
                CarrierSubject: emailFields.subject,
                CarrierBody: emailFields.body,
                CarrierAttachment: JSON.stringify(emailFields.attachments),
            }
        } else if (cuzInd.toUpperCase() === 'IN') {
            emailFields = {
                InternalFrom: emailFields.from,
                InternalTo: emailFields.to,
                InternalCc: emailFields.cc,
                InternalSubject: emailFields.subject,
                InternalBody: emailFields.body,
                InternalAttachment: JSON.stringify(emailFields.attachments),
            }
        }
        await rp(options)
            .then(async (resp) => {
                //update email to issue
                //clean attachments except inline
                if (Array.isArray(emailFields.CustomerAttachment)) {
                    emailFields.CustomerAttachment = emailFields.CustomerAttachment.filter((item) => { return item.cid })
                }

                if (Array.isArray(emailFields.CarrierAttachment)) {
                    emailFields.CarrierAttachment = emailFields.CarrierAttachment.filter((item) => { return item.cid })
                }

                if (Array.isArray(emailFields.InternalAttachment)) {
                    emailFields.InternalAttachment = emailFields.InternalAttachment.filter((item) => { return item.cid })
                }
                updateIssue(issueKey, emailFields)
            })
            .catch(function (err) {
                //console.log(err)
                if (err.statusCode == 501) {
                    console.log('issue not found, creating issue')
                    emailFields = {
                        CustomerFrom: emailFields.from,
                        CustomerTo: emailFields.to,
                        CustomerCc: emailFields.cc,
                        CustomerSubject: emailFields.subject,
                        CustomerBody: emailFields.body,
                        CustomerAttachment: JSON.stringify(emailFields.attachments),
                    }
                    emailFields = bodyMassage(emailFields, req.body.info.to)
                    createIssue(emailFields)
                } else {
                    console.log(err)
                }
            })
    } else {
        emailFields = {
            CustomerFrom: emailFields.from,
            CustomerTo: emailFields.to,
            CustomerCc: emailFields.cc,
            CustomerSubject: emailFields.subject,
            CustomerBody: emailFields.body,
            CustomerAttachment: JSON.stringify(emailFields.attachments),
        }
        emailFields = bodyMassage(emailFields, req.body.info.to)
        createIssue(emailFields)
    }

    res.json(ret)
})

const bodyMassage = ((emailFields, to) => {
    let newFields = emailFields
    newFields.CustomerCc = emailFields.CustomerCc.replace(/\\t/g, '').replace(/,/g, ';')
    newFields.CustomerBody =
        `<meta charset="utf-8" /><p class="MsoNormal"><b>From:</b> ` + emailFields.CustomerFrom + `
            <br><b>Sent:</b> `+ momenttz(new Date()).tz('Asia/Hong_Kong').format() + `
            <br><b>To:</b> `+ to
        + (emailFields.CustomerCc ? `<br><b>Cc:</b> ` + emailFields.CustomerCc : '') +
        `<br><b>Subject:</b> ` + emailFields.CustomerSubject + `<o:p></o:p></p></div>` +
        Base64.decode(emailFields.CustomerBody)
    newFields.CustomerBody = Base64.encode(newFields.CustomerBody)
    return newFields
})

const createIssue = ((fields) => {
    let issueOptions = {
        method: 'post',
        uri: process.env.LOCALHOST + '/set/jira/issue/createIssue',
        json: true,
        body: {
            createIssue: {
                project: {
                    key: "IBVSD"
                },
                issuetype: {
                    name: "Incident"
                },
                summary: fields.CustomerSubject
            }
        }
    }
    rp(issueOptions).then((json) => {
        console.log('got issue key: ' + json.key)
        let issueKey = json.key
        let fieldsAddedIssueKey = fields
        fieldsAddedIssueKey.CarrierSubject = '[' + issueKey + 'CA]' + fieldsAddedIssueKey.CustomerSubject
        fieldsAddedIssueKey.InternalSubject = '[' + issueKey + 'IN]' + fieldsAddedIssueKey.CustomerSubject
        fieldsAddedIssueKey.CustomerSubject = '[' + issueKey + 'CU]' + fieldsAddedIssueKey.CustomerSubject
        updateIssue(issueKey, fieldsAddedIssueKey)
    })
})

const updateIssue = ((issueId, fields) => {
    //console.log(fields)

    let issueOptions = {
        method: 'post',
        uri: process.env.LOCALHOST + '/IBVSD/updateEmailToIssue',
        json: true,
        body: {
            issueKey: issueId,
            email: fields
        }
    }
    rp(issueOptions)
})

router.post('/updateEmailToIssue', async (req, res, next) => {
    let ret = {}

    let orgFields = req.body.email

    const options = {
        method: 'post',
        uri: process.env.LOCALHOST + '/get/jira/issue/allFieldMappingAllRev',
        json: true,
        body: { fields: { "summary": "" }, showHidden: true }
    }
    let fieldWithNames = await rp(options).then((mappedJson) => {
        return mappedJson
    })

    let updateFields = {}

    //console.log(fieldWithNames)
    //console.log(orgFields)
    Object.keys(orgFields).forEach((fieldName) => {
        updateFields[fieldWithNames[fieldName]] = orgFields[fieldName]
    })

    //update issue
    const UpdateOptions = {
        method: 'post',
        uri: process.env.LOCALHOST + '/set/jira/issue/updateIssue',
        json: true,
        body: {
            updateIssue: {
                issueId: req.body.issueKey,
                fields: updateFields
            }
        }
    }
    rp(UpdateOptions).then((ret) => {
        res.json({ status: "success" })
    })
})


module.exports = router;
module.exports.updateIssue = updateIssue