import express  from 'express'
import mysql  from 'mysql'

const router = express.Router();

router.get('/getSQL', function (req, res, next) {
  const query = `SELECT * from Service
`

  const con = mysql.createConnection({
    host: '172.25.13.74',
    port: 3306,
    user: 'nttstest',
    password: '777ntts',
    database: 'CircuitDBLive',
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
})

module.exports = router;