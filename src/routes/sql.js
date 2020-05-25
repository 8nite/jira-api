import express from 'express'
import mysql from 'mysql'
import oracledb from 'oracledb'
import moment from 'moment'
require('dotenv').config()

const router = express.Router();

router.get('/getTableData', async (req, res, next) => {
  oracledb.getConnection(
    {
      user: req.query.user,
      password: req.query.password,
      connectString: "NOC"
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

      let result = await connection.execute(sql, binds, options);
      console.log(result)
      res.send(result)
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
      user: "dsbs",
      password: "abc123",
      connectString: "172.25.15.138:1521/fbiu"
    },
    async function (err, connection) {
      console.error('connected!')
      if (err) { console.error(err); return; }
      let valueText = 'INSERT INTO ' + req.body.sql.tableName + ' VALUES ('
      let valueArray = []
      let count = 1
      req.body.sql.values.forEach((element) => {
        //console.log(element)
        if (moment(element, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
          valueText += "TO_DATE(:" + count.toString() + ", 'yyyy-mm-dd hh24:mi:ss'),"
          valueArray.push(moment(element, "YYYY-MM-DD HH:mm:ss").format('YYYY-MM-DD HH:mm:ss').toString())
        } else {
          valueText += ":" + count.toString() + ","
          valueArray.push(element)
        }
        count++
      })
      valueText = valueText.substring(0, valueText.length - 1) + ')'
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