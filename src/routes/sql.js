import express from 'express'
import mysql from 'mysql'
import oracledb from 'oracledb'

const router = express.Router();

router.get('/getSQL', async (req, res, next) => {
  /*
  const query = `SELECT * from Service
`

  const con = mysql.createConnection({
    host: '172.25.15.138',
    port: 1521,
    user: 'fbi',
    password: 'abc123',
    database: 'fbiu',
    insecureAuth: true
  })

  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(query, function (err, result) {
      if (err) throw err;
      console.log(result)
    });
  });
  const config = {
    user: 'fbi',
    password: 'abc123',
    host: '172.25.15.138:1521',
    database: 'fbiu'
  }

  client
    .connect(config, () => {      
      console.log('Connected!')    
    })
    /*.then((connection => {
      console.log('Connected!')
      return connection
        .execute("select * from all_objects where object_name = 'JIRA_CPE_TYPE'")
        .then(result => {
          console.log('Queried!')
          return connection
            .close()
            .then(() => result);
        })
        .catch(err => {
          console.log(err)
          return connection
            .close()
            .then(() => Promise.reject(err));
        });
    }))*/

    oracledb.getConnection(
      {
        user          : "fbi",
        password      : "abc123",
        connectString : "172.25.15.138:1521/fbiu"
      },
      function(err, connection)
      {
        console.error('connected!')
        if (err) { console.error(err); return; }
        connection.execute(
          "select * from AA",
          function(err, result)
          {
            if (err) { console.error(err); return; }
            console.log(result.rows);
          });
      });
})

module.exports = router;