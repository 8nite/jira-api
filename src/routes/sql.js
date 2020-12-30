import express from 'express'
import mysql from 'mysql'
import oracledb from 'oracledb'
import queryString from 'query-string'
import moment from 'moment'
import rp from 'request-promise'
require('dotenv').config()

const router = express.Router();

router.get('/getTableData', async (req, res, next) => {
  oracledb.getConnection(
    {
      user: req.query.user,
      password: req.query.password,
      connectString: req.query.connString
    },
    async function (err, connection) {
      if (err) {
        console.error(err, req.query.connString)
        res.send(err)
      }
      const sql = "select * from " + req.query.tableName
      let binds = {};

      // For a complete list of options see the documentation.
      let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
        // extendedMetaData: true,   // get extra metadata
        // fetchArraySize: 100       // internal buffer allocation size for tuning
      };

      try {
        let result = await connection.execute(sql, binds, options);
        console.log(result)
        res.send(result)
      } catch (e) {
        res.send(e)
      }
    })

})

router.get('/getTableHeader', async (req, res, next) => {
  oracledb.extendedMetaData = true
  oracledb.getConnection(
    {
      user: req.query.user,
      password: req.query.password,
      connectString: req.query.connString
    },
    async function (err, connection) {
      if (err) {
        console.error(err, req.query.connString)
        res.send(err)
      }
      const sql = "SELECT * FROM " + req.query.tableName
      let binds = {};

      // For a complete list of options see the documentation.
      let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
        // extendedMetaData: true,   // get extra metadata
        // fetchArraySize: 100       // internal buffer allocation size for tuning
      };
      try {
        let result = await connection.execute(sql, binds);
        //console.log(result)
        res.send(result)
      } catch (e) {
        res.send(e)
      }
    })
})

router.get('/getSQL', async (req, res, next) => {
  oracledb.getConnection(
    {
      user: "dsbs",
      password: "abc123",
      connectString: "172.25.15.138:1521/fbiu"
    },
    async function (err, connection) {
      const sql = "select * from DSBS.JIRA_CPE_TYPE"
      let binds = {};

      // For a complete list of options see the documentation.
      let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
        // extendedMetaData: true,   // get extra metadata
        // fetchArraySize: 100       // internal buffer allocation size for tuning
      };

      let result = await connection.execute(sql, binds, options);
      console.log(result)
      res.send(result)
    })

})

router.post('/insertSQL', async (req, res, next) => {
  oracledb.getConnection(
    {
      user: req.body.sql.user,
      password: req.body.sql.password,
      connectString: req.body.sql.connString
    },
    async function (err, connection) {
      console.error('connected!')
      if (err) { console.error(err); return; }
      //Reformating
      console.log('trying to meta data')
      let metaData
      const formatting = req.body.sql.formatting
      if (formatting) {
        let query = {
          user: req.body.sql.user,
          password: req.body.sql.password,
          connString: req.body.sql.connString,
          tableName: req.body.sql.tableName
        }
        metaData = await rp({
          uri: process.env.LOCALHOST + '/sql/getTableHeader?' + queryString.stringify(query),
          json: true
        }).then(($) => {
          return $.metaData
        })
        console.log('got meta data')
      }
      //Delete before insert
      try {
        console.log('trying to remove data before insert')
        const delRow = req.body.sql.delRow
        if (Object.keys(delRow).length > 0) {
          let sql = 'DELETE FROM ' + req.body.sql.tableName + ' WHERE '
          let values = []
          let count = 1
          Object.keys(delRow).forEach((field) => {
            if (moment(delRow[field], "YYYY-MM-DD HH:mm:ss", true).isValid()) {
              sql += field + ' = :' + count.toString() + ' AND '
              values.push('TO_DATE(' + moment(field).format('YYYY/MM/DD HH:mm:ss') + '\' = \'' + delRow[field] + '\', \'yyyy/mm/dd hh24:mi:ss\'))')
            } else {
              sql += field + ' = :' + count.toString() + ' AND '
              values.push(delRow[field])
            }
          })
          sql = sql.substring(0, sql.length - 4)
          console.log(sql)
          console.log(values)
          const result = await connection.execute(sql, values, { autoCommit: true })
          console.log('removed data before insert')
        }
      } catch (e) {
        console.log(e)
      }

      //insert
      let insertFields = req.body.sql.fields
      let insertValues = req.body.sql.values

      if (formatting) {
        console.log('formatting to match metadata')
        insertFields = []
        insertValues = []
        metaData.forEach((col) => {
          let index
          let count = 0
          req.body.sql.fields.forEach((field) => {
            if (col.name === field) {
              index = count
            }
            count++
          })
          if (index || index == 0) {
            try {
              if (col.dbTypeName.includes('VARCHAR')) {
                if ((new TextEncoder().encode(req.body.sql.values[index])).length <= col.byteSize) {
                  insertValues.push(req.body.sql.values[index])
                  insertFields.push(col.name)
                }
                else if ((new TextEncoder().encode(req.body.sql.values[index])).length > col.byteSize) {
                  insertValues.push(req.body.sql.values[index].substring(0, Math.floor(col.byteSize / 2)))
                  insertFields.push(col.name)
                }
              }
              else if (col.dbTypeName.includes('DATE')) {
                insertValues.push(req.body.sql.values[index])
                insertFields.push(col.name)
              }
              else if (col.dbTypeName.includes('NUMBER')) {
                if (!isNaN(parseFloat(req.body.sql.values[index]))) {
                  insertValues.push(Math.round(req.body.sql.values[index] * col.precision) / col.precision)
                  insertFields.push(col.name)
                }
              }
              //console.log(insertValues.length)
              //console.log(insertValues.length)
            } catch { }
          }
        })
        console.log('done formatting')
        //console.log(insertFields)
        //console.log(insertValues)
      }
      console.log('inserting data')
      let valueText = 'INSERT INTO ' + req.body.sql.tableName + ' (' + insertFields.join(',') + ') VALUES ('
      let valueArray = []
      let count = 1
      insertValues.forEach((element) => {
        //console.log(valueText)
        //console.log(valueArray)
        //console.log(element.substring(0,19).replace('T', ' '))
        //console.log(moment(element.substring(0,19).replace('T', ' '), "YYYY-MM-DD HH:mm:ss", true).isValid())
        try {
          if (element) {
            if (typeof element !== 'string') {
              valueArray.push(element)
              valueText += ":" + count.toString() + ","
            }
            else if (moment(element.substring(0, 19).replace('T', ' '), "YYYY-MM-DD HH:mm:ss", true).isValid()) {
              //console.log('THIS IS DATE')
              //console.log(element)
              valueArray.push(moment(element.substring(0, 19).replace('T', ' '), "YYYY-MM-DD HH:mm:ss").format('YYYY-MM-DD HH:mm:ss').toString())
              valueText += "TO_DATE(:" + count.toString() + ", 'YYYY-MM-DD HH24:MI:SS'),"
            } else {
              console.log(count + ' ' + element)
              valueArray.push(element || '')
              valueText += ":" + count.toString() + ","
            }
          }
          else {
            valueArray.push(null)
            valueText += ":" + count.toString() + ","
          }
          count++
        } catch {
          valueArray.push(null)
          valueText += ":" + count.toString() + ","
          count++
        }
      })
      console.log(valueText)
      console.log(valueArray)
      valueText = valueText.substring(0, valueText.length - 1) + ')'
      const sql = valueText
      const values = valueArray
      //console.log(valueText)
      //console.log(valueArray)
      try {
        const result = await connection.execute(sql, values, { autoCommit: true })
        //console.log(result)
        console.log('done inserting data')
        res.send(result)
      } catch (err) {
        if (err)
          console.error(err);
        res.status(500).send(err)
      }
    });
})

router.post('/updateSQL', async (req, res, next) => {
  oracledb.getConnection(
    {
      user: "dsbs",
      password: "abc123",
      connectString: "172.25.15.138:1521/fbiu"
    },
    async function (err, connection) {
      console.error('connected!')
      if (err) { console.error(err); return; }
      let valueText = 'UPDATE ' + req.body.tableName + ' SET '
      let valueArray = []
      let count = 1
      Object.keys(req.body.values).forEach((key) => {
        if (moment(req.body.values[key], "YYYY-MM-DD HH:mm:ss", true).isValid()) {
          valueText += key + "=TO_DATE(:" + count.toString() + ", 'yyyy-mm-dd hh24:mi:ss'),"
          valueArray.push(moment(req.body.values[key], "YYYY-MM-DD HH:mm:ss").format('YYYY-MM-DD HH:mm:ss').toString())
        } else {
          valueText += key + "=:" + count.toString() + ","
          valueArray.push(req.body.values[key])
        }
        count++
      })
      valueText = valueText.substring(0, valueText.length - 1) + ' WHERE ' + Object.keys(req.body.find)[0] + '=' + req.body.find[Object.keys(req.body.find)[0]]

      const sql = valueText
      const values = valueArray
      console.log(valueText)
      console.log(valueArray)
      try {
        const result = await connection.execute(sql, values, { autoCommit: true })
        console.log(result)
        res.send(result)
      } catch (err) {
        if (err)
          console.error(err);
      }
    });
})


router.post('/deleteSQL', async (req, res, next) => {
  oracledb.getConnection(
    {
      user: "dsbs",
      password: "abc123",
      connectString: "172.25.15.138:1521/fbiu"
    },
    async function (err, connection) {
      console.error('connected!')
      if (err) { console.error(err); return; }
      let valueText = 'DELETE FROM ' + req.body.tableName + ''
      let valueArray = []
      let count = 1
      valueText += ' WHERE ' + Object.keys(req.body.find)[0] + "='" + req.body.find[Object.keys(req.body.find)[0]] + "'"

      const sql = valueText
      const values = valueArray
      console.log(valueText)
      console.log(valueArray)
      try {
        const result = await connection.execute(sql, values, { autoCommit: true })
        console.log(result)
        res.send(result)
      } catch (err) {
        if (err)
          console.error(err);
      }
    });
})

module.exports = router;