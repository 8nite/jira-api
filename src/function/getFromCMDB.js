import rp from 'request-promise'
import queryString from 'query-string'

require('dotenv').config()

export const getCMDB = (async (schemaName, sourceType, sourceAttr, attr, ret) => {
    return new Promise(function (resolve, reject) {

        let query = {
            objectSchemaName: schemaName,
            objectTypeName: sourceType,
            findAttribute: sourceAttr,
            findValue: attr,
            returnAttribute: ret
        }

        const getAssGrpOptions = {
            uri: 'http://' + process.env.LOCALHOST + ':' + process.env.JIRAAPIPORT + '/get/jira/object/attributeValue?' + queryString.stringify(query),
            json: true
        }

        rp(getAssGrpOptions)
            .then((objects) => {
                resolve(objects)
            })
    })
})

export const getFieldMapping = (async (fields, ret) => {
    const options = {
        method: 'post',
        uri: process.env.LOCALHOST + '/get/jira/issue/allFieldMapping',
        json: true,
        body: { fields }
    }
    return await rp(options).then((mappedJson) => {
        let orgFields = fields
        let ret = {}
        Object.keys(orgFields).forEach((orgName) => {
            ret[mappedJson[orgName]] = orgFields[orgName]
        })
        return ret
    })
})
