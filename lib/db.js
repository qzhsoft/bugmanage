var mssql = require('mssql');


var config = {
    user: 'sa',
    password: '7895123',
    server: '192.168.1.200', 
    database: 'BFSS',
    driver: 'tedious',
    port:'1433',
    options: {
        instanceName: 'SQLEXPRESS',
        encrypt: false  // Use this if you're on Windows Azure
    }
};


//查询sql
// cb = function(err,data); 其中data是返回值
//
exports.query = function(sql,cb){
  
  var connection = new mssql.Connection(config, function(err) {
    if(!err){
      var request = new mssql.Request(connection); 
      request.query(sql,function(err,recordset){
        if(!err){
          if(cb) cb(null,recordset); 
          connection.close();
        }
        else{
          connection.close();
          if(cb) cb(err);
        }
      });
    }
    else{
      if(cb) cb(err);
    }
  });
};

//执行sql,与库操作
exports.exec = function(sql,cb){
  
};

