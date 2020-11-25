import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
import { updateIssue } from './index'
import { Base64 } from 'js-base64'
import { getCMDB } from '../../function/getFromCMDB'

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

  let newAttach = null

  if (req.body.sendToCustomerAttachment) {
    newAttach = JSON.parse(req.body.sendToCustomerAttachment)
  }

  if (newAttach && Array.isArray(newAttach) && newAttach.length > 0) {
    //console.log(newAttach)
    attachments = attachments.concat(newAttach.map((item) => {
      console.log(item['URI'].toString().substring(0, 50))
      return {
        filename: item.filename,
        content: item['URI'].toString().split('base64,')[1],
        encoding: 'base64'
      }
    }))
  }

  //console.log(attachments)

  options = {
    method: 'post',
    uri: process.env.EMAILAPI + '/email/sendToCustomerCarrierInternal',
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

router.post('/sendToCarrier', async (req, res, next) => {
  //console.log(req.body)
  //console.log(req.body.sendToCarrierAttachment)

  const issueKey = req.body.issueKey

  let options = {
    uri: process.env.LOCALHOST + '/get/jira/issue/issueNames?issueId=' + issueKey,
    json: true
  }
  const issue = await rp(options).then((ret) => {
    return ret
  })

  let Salute = ''
  let CC_List = []
  CC_List[0] = ''
  let subjectPrefix = ''

  let to = (issue.fields.CarrierFrom ? issue.fields.CarrierFrom : '')
  if (issue.fields['Carrier Supplier'] && Array.isArray(issue.fields['Carrier Supplier'])) {
    await issue.fields['Carrier Supplier'].forEach(async (cs) => {
      console.log(cs.match(/(.*) \([-A-Z0-9]*\)$/)[1])
      let query = {
        objectSchemaName: 'IBVSD',
        objectTypeName: 'Carrier',
        value: cs.match(/(.*) \([-A-Z0-9]*\)$/)[1],
        attribute: 'Carrier',
      }
      const options1 = {
        uri: process.env.LOCALHOST + '/get/jira/object/includeAttributObject?' + queryString.stringify(query),
        json: true
      }
      await rp(options1)
        .then((ret) => {
          if (ret && ret.length > 0) {
            if (ret[0]['CC List']) {
              CC_List[0] += ';' + ret[0]['CC List']
            }
            if (ret[0]['Email List']) {
              to += ';' + ret[0]['Email List']
              console.log('to: ' + to)
            }
          }
        })
    })
  }
  console.log(issue.fields['Carrier Supplier'][0].match(/(.*) \([-A-Z0-9]*\)$/)[1])
  console.log('sending to carrier: ' + to)

  let cc = (issue.fields.CarrierCc ? issue.fields.CarrierCc + ';' : '')
  cc = (CC_List.length > 1 ? cc + ';' + CC_List : cc)
  let subject = issue.fields.CarrierSubject
  if (!subject.includes(subjectPrefix)) {
    subject = subjectPrefix + subject
  }
  let body =
    req.body.sendToCarrierMessage + '<br><br>' +
    `<div style="border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm">` +
    (!issue.fields.CarrierBody || issue.fields.CarrierBody == '' ? '' : Base64.decode(issue.fields.CarrierBody))
  body = body.replace(/\r/g, '').replace(/\n/g, '')

  let issueKeyinSubject = null
  let cuzInd = null
  try {
    issueKeyinSubject = req.body.info.subject.match(/\[(IBVSD-[0-9]+)([a-zA-Z][a-zA-Z])\]/)[1]
    cuzInd = req.body.info.subject.match(/\[(IBVSD-[0-9]+)([a-zA-Z][a-zA-Z])\]/)[2]
  } catch { }

  if (issueKeyinSubject && cuzInd) {
    subject = '[' + issueKey + 'CA]' + subject
  }

  let attachments = []
  try {
    attachments = JSON.parse(issue.fields.CarrierAttachment)
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

  if (req.body.sendToCarrierAttachment) {
    newAttach = JSON.parse(req.body.sendToCarrierAttachment)
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
    uri: process.env.EMAILAPI + '/email/sendToCustomerCarrierInternal',
    json: true,
    body: {
      to, cc, subject, body: Base64.encode(body),
      attachments
    }
  }

  await rp(options)
    .then((ret) => {
      //console.log(ret)
      updateIssue(issueKey, { CarrierBody: Base64.encode(body) })
    })

  res.send({
    status: 0
  })
})


router.post('/sendToInternal', async (req, res, next) => {
  //console.log(req.body)
  //console.log(req.body.sendToInternalAttachment)

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
    objectTypeName: 'Internal',
    value: issue.fields.InternalFrom,
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

  const to = issue.fields.InternalFrom
  let cc = (issue.fields.InternalCc ? issue.fields.InternalCc + ';' : '')
  cc = (CC_List.length > 1 ? cc + ';' + CC_List : cc)
  let subject = issue.fields.InternalSubject
  if (!subject.includes(subjectPrefix)) {
    subject = subjectPrefix + subject
  }
  let body = (Salute && Salute.length > 0 ? Salute + '<br><br>' : '') +
    req.body.sendToInternalMessage + '<br><br>' +
    `<div style="border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm">` +
    Base64.decode(issue.fields.InternalBody)
  body = body.replace(/\r/g, '').replace(/\n/g, '')

  let issueKeyinSubject = null
  let cuzInd = null
  try {
    issueKeyinSubject = req.body.info.subject.match(/\[(IBVSD-[0-9]+)([a-zA-Z][a-zA-Z])\]/)[1]
    cuzInd = req.body.info.subject.match(/\[(IBVSD-[0-9]+)([a-zA-Z][a-zA-Z])\]/)[2]
  } catch { }

  if (issueKeyinSubject && cuzInd) {
    subject = '[' + issueKey + 'IN]' + subject
  }

  let attachments = []
  try {
    attachments = JSON.parse(issue.fields.InternalAttachment)
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

  if (req.body.sendToInternalAttachment) {
    newAttach = JSON.parse(req.body.sendToInternalAttachment)
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
    uri: process.env.EMAILAPI + '/email/sendToCustomerCarrierInternal',
    json: true,
    body: {
      to, cc, subject, body: Base64.encode(body),
      attachments
    }
  }

  await rp(options)
    .then((ret) => {
      //console.log(ret)
      updateIssue(issueKey, { InternalBody: Base64.encode(body) })
    })

  res.send({
    status: 0
  })
})

module.exports = router;