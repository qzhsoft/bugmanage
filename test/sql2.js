var db = require('mssqlhelper');

db.config({
    host: '42.120.50.205'
    ,port: 1433
    ,userName: 'sa'
    ,password: 'qzh456123'
    ,database:'qsPrison'
});

//test query sql 执行sql

db.query(
    'select * from hz_syUserInfo'
    ,{
         
    }
    ,function(res){
        if(res.err)throw new Error('database error:'+res.err.msg);
        var rows = res.tables[0].rows;
        for (var i = 0; i < rows.length; i++) {
            console.log(rows[i]);
        }
    }
);