import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
import { updateIssue } from './index'
import { Base64 } from 'js-base64'
require('dotenv').config()

const router = express.Router();

router.post('/sendToCustomer', async (req, res, next) => {
  //console.log(req.body)
  //console.log(req.body.sendToCustomerAttachment)

  const issueKey = req.body.issueKey

  options = {
    uri: process.env.LOCALHOST + '/get/jira/issue/issueNames?issueId=' + issueKey,
    json: true
  }
  const issue = await rp(options).then((ret) => {
    return ret
  })

  let query = {
    objectSchemaName: 'IBVSD',
    objectTypeName: 'Customer',
    value: issue.fields.CustomerFrom,
    attribute: 'Sender',
  }
  let options = {
    uri: process.env.LOCALHOST + '/get/jira/object/includeAttributObject?' + queryString.stringify(query),
    json: true
  }

  let Salute = ''
  let CC_List = []
  let subjectPrefix = ''

  await rp(options)
    .then((ret) => {
      if (ret && ret.length > 0) {
        if (ret[0].Salute) {
          Salute = ret[0].Salute
        }
        if (ret[0].CC_List) {
          CC_List = ret[0].CC_List
        }
        if (ret[0]['Subject Prefix']) {
          subjectPrefix = ret[0]['Subject Prefix']
        }
      }
    })

  const to = issue.fields.CustomerFrom
  let cc = (issue.fields.CustomerCc ? issue.fields.CustomerCc + ';' : '')
  cc = (CC_List.length > 1 ? cc + ';' + CC_List : cc)
  let subject = issue.fields.CustomerSubject
  if (!subject.includes(subjectPrefix)) {
    subject = subjectPrefix + subject
  }
  let body = (Salute && Salute.length > 0 ? Salute + '<br><br>' : '') +
    req.body.sendToCustomerMessage + '<br><br>' +
    `<div style="border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm">` +
    Base64.decode(issue.fields.CustomerBody)
  body = body.replace(/\r/g, '').replace(/\n/g, '')

  let issueKeyinSubject = null
  let cuzInd = null
  try {
    issueKeyinSubject = req.body.info.subject.match(/\[(IBVSD-[0-9]+)([a-zA-Z][a-zA-Z])\]/)[1]
    cuzInd = req.body.info.subject.match(/\[(IBVSD-[0-9]+)([a-zA-Z][a-zA-Z])\]/)[2]
  } catch { }

  if (issueKeyinSubject && cuzInd) {
    subject = '[' + issueKey + 'CU]' + subject
  }

  let attachments = []
  try {
    attachments = JSON.parse(issue.fields.CustomerAttachment)
  } catch { }
  attachments = attachments.map((attachment) => {
    if (attachment.isMsg) {
      attachment.content = Base64.decode(attachment.content)
      attachment.filename = "email.eml",
        attachment.contentType = 'text/plain'
      delete attachment.encoding
    }
    return attachment
  })

  const newAttach = null
  
  if (req.body.sendToCustomerAttachment) {
    newAttach = JSON.parse(req.body.sendToCustomerAttachment)
  }

  if (newAttach && Array.isArray(newAttach) && newAttach.length > 0) {
    console.log(newAttach)
    attachments = attachments.concat(newAttach.map((item) => {
      return {
        filename: item.filename,
        content: item.URI,
        encoding: 'base64'
      }
    }))
  }

  //console.log(attachments)

  options = {
    method: 'post',
    uri: process.env.EMAILAPI + '/email/sendToCustomer',
    json: true,
    body: {
      to, cc, subject, body: Base64.encode(body),
      attachments
    }
  }

  await rp(options)
    .then((ret) => {
      //console.log(ret)
      updateIssue(issueKey, { CustomerBody: Base64.encode(body) })
    })

  res.send({
    status: 0
  })
})

module.exports = router;