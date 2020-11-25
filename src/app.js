import createError from 'http-errors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../swagger.json'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import debug from 'debug'
import http from 'http'
import indexRouter from './routes/index'
import path from 'path'
import rp from 'request-promise'
import fs from 'fs'

require('dotenv').config()

if (!process.env.LD_LIBRARY_PATH || process.env.LD_LIBRARY_PATH.length < 2) {
  throw 'LD_LIBRARY_PATH not set!'
}

const app = express();

// view engine setup
app.use(logger(':date[iso] :method :url :status :response-time ms - :res[content-length]'));
app.use(express.json({ limit: '2000mb', extended: true }));
app.use(express.urlencoded({ limit: '2000mb', extended: true }));
app.use(cookieParser());
app.use('/api/public', express.static('public'))

app.use('/', indexRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


//rp(process.env.LOCALHOST + '/4objectCreate')

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, '0.0.0.0');
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
/*
var imageBuffer = Buffer.from('PHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcHQiIHNyYz0iaHR0cDovL3d3dy51bnZlcnNlLm5ldC93aGl6emVyeS93aGl6enl3aWc2My5qcyI+PC9zY3JpcHQ+CgoKPGZvcm0gaWQ9InNlbmRUb0N1c3RvbWVyRm9ybSIgbWV0aG9kPSJwb3N0IiBlbmN0eXBlPSJtdWx0aXBhcnQvZm9ybS1kYXRhIj4KPGxhYmVsIGZvcj0ibWVzc2FnZSI+TWVzc2FnZTo8L2xhYmVsPgo8dGV4dGFyZWEgdGV4dGFyZWEgaWQ9InNlbmRUb0N1c3RvbWVyTWVzc2FnZSIgbmFtZT0ibWVzc2FnZSI+CjwvdGV4dGFyZWE+ClNlbGVjdCBBIEZpbGUgVG8gVXBsb2FkOiA8aW5wdXQgaWQ9InNlbmRUb0N1c3RvbWVyQXR0YWNobWVudCI+PGJyIC8+CjxpbnB1dCBpZD0ic2VuZFRvQ3VzdG9tZXJGb3JtU3VibWl0IiB0eXBlPSJzdWJtaXQiIGNsYXNzPSJhdWktYnV0dG9uIGF1aS1idXR0b24tcHJpbWFyeSBzZC1leHRlcm5hbC1zdWJtaXQiIHZhbHVlPSJTdWJtaXQiPgo8L2Zvcm0+Cgo8c2NyaXB0PndoaXp6eXdpZygpOzwvc2NyaXB0Pg==', 'base64')
fs.writeFile(path.resolve(__dirname) + "/public/temp/test.jpg", imageBuffer, async (err) => {
  if (!err) {
    const options = {
      method: 'POST',
      auth: {
        'user': process.env.JIRAUSER,
        'pass': process.env.JIRAPASS
      },
      uri: process.env.JIRAURL + '/rest/api/2/issue/IBVSD-240/attachments',
      json: true,
      formData: {
        file: {
          value: fs.createReadStream(path.resolve(__dirname) + '/public/temp/test.jpg'),
          options: {
            filename: 'test.html',
          }
        }
      },
      headers: {
        'X-Atlassian-Token': 'no-check'
      }
    }

    await rp(options)

    fs.unlink(path.resolve(__dirname) + "/public/temp/test.jpg", () => {})
  }
})*/