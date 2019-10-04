var async = require('async');
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

var tasks = [];

tasks.push(function(next) {
    mssql.connect(config, function(err) {
        console.log("01");
        next(err);
    });
});

// tasks.push(function(next) {
//     var request = new mssql.Request();
//     request.input('user_id', mssql.NVarChar, 'KT067');
//     requestSql(request, 'SELECT * FROM m_users WHERE user_id = \'KT067\'', function(errors, ret) {
//       console.log(util.inspect(ret,false,null));
//       next(errors);
//     });
//     console.log("02");
// });

tasks.push(function(next) {
    console.log("03");
    var request = new mssql.Request(); // or: var request = connection.request();
    request.stream = true;
    request.query('SELECT * FROM m_users');
    request.on('recordset', function(columns) {
       // レコードセットを取得するたびに呼び出される
       console.log(columns);
    });
    request.on('row', function(row) {
       // 行を取得するたびに呼ばれる
       console.log(row);
    });

    request.on('error', function(err) {
       // エラーが発生するたびによばれる
       console.log(err);
    });

    request.on('done', function(returnValue) {
        // 常時最後によばれる
        console.log(returnValue);
    })
});

async.waterfall(tasks, function(err) {
    if(err) {
        console.log(err);
        process.exit();
    }
    mssql.close();
});

function requestSql(request, sql, callback)
{
  console.log(sql);
  var errors = [];
  var result = [];
  var records = [];
  request.query(sql);

  request.on('recordset', function(columns) {
    console.log("req01");
    // Emitted once for each recordset in a query
    // console.log(columns);
    var rec = {
      columns:columns,
      records: []
    };
    result.push(rec);
  });

  request.on('row', function(row) {
    console.log("req02");
    // Emitted for each row in a recordset
    result[result.length - 1].records.push(row);
    console.dir(result)
    // console.log(result);
  });

  request.on('error', function(err) {
    console.log("req03");
    // May be emitted multiple times
    errors.push(err);
  });

  request.on('done', function(returnValue) {
    console.log("req04");
    console.log(returnValue);
    // Always emitted as the last one
    if (errors.length == 0) {
      callback(null, result);
    } else {
      callback(errors, result);
    }
  });

}

