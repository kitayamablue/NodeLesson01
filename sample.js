var mssql = require('mssql');
var settings = require('./settings.js');
var async = require('async');
var util = require('util');

var config = {
  user: settings.user,
  password: settings.password,
  server: settings.server,
  database: settings.database,
  stream: true,

  options: {
    encrypt: true
  }
}

mssql.connect(config).then(() => {
    return mssql.query`select * from m_users`
}).then(result => {
    console.dir(result)
}).catch(err => {
    // ... error checks
})

mssql.on('error', err => {
    // ... error handler
})