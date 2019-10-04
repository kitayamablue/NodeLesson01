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
// 接続
tasks.push(function(next) {
    mssql.connect(config, function(err) {
        next(err);
    });
});

// TESTデータ削除
// tasks.push(function(next) {
//     var request = new mssql.Request();
//     request.input('user_id', mssql.NVarChar, 'KT178');
//     requestSql(request, 'DELETE FROM m_users WHERE user_id >= @user_id', function(errors, ret) {
//       console.log(util.inspect(ret,false,null));
//       next(errors);
//     });
// });

// PREPARESTATEMENTを用いたSELECT
tasks.push(function(next) {
    var request = new mssql.Request();
    request.input('userid', mssql.NVarChar, 'KT067');
    requestSql(request, 'SELECT * FROM m_users WHERE user_id = @userid', function(errors, ret) {
      console.log(util.inspect(ret,false,null));
      next(errors);
    });
});

//
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
  // var records = [];

  request.stream = true;
  request.query(sql);

  request.on('recordset', function(columns) {
    // レコードセットを取得するたびに呼び出される
    // console.log(columns);
    // var rec = {
    //   columns:columns,
    //   records: []
    // };
    var rec = {
      records: []
    };
    result.push(rec);
  });

  request.on('row', function(row) {
    // 行を取得するたびに呼ばれる
    result[result.length - 1].records.push(row);
  });

  request.on('error', function(err) {
    // エラーが発生するたびによばれる
    errors.push(err);
  });

  request.on('done', function(returnValue) {
    // console.log(returnValue);
    // 常時最後によばれる
    if (errors.length == 0) {
      callback(null, result);
    } else {
      callback(errors, result);
    }
  });
}




