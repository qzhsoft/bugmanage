var sql = require('mssql');

var config = {
    user: 'sa',
    password: '7895123',
    server: '192.168.1.200', // You can use 'localhost\\instance' to connect to named instance
    database: 'BFSS',
    driver: 'tedious',
    port:'1434',
    
    options: {
        instanceName: 'SQLEXPRESS',
        encrypt: false  // Use this if you're on Windows Azure
    }

};





var sqltxt = 'select * from TB_BUG_TREE';

var sqltxt2000= 'select * from TB_BUG_TREE';

sql.connect(config,function(err){
    if(!err){
      console.log('ok');
      new sql.Request().query(sqltxt, function(err, recordset) {
        // ... error checks

        console.dir(recordset);
    }); 
    }
    else{
      console.log(err);  
    }
    
});

console.log('===========================');

var mydb = require('../lib/db.js');
mydb.query('select count(*) as myv from TB_BUG_TREE',function(err,data){
  console.log(err);
  console.log(data);
});

//select * from TB_USER_ITEM where ZNAME="龙仕云" and ZPASS="456123" 
   