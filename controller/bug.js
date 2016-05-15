var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');
var EventProxy = require('eventproxy');

//创建新的bug
router.get('/create',function(req,res,next){
  var page = req.query.page;
  
  var ep = new EventProxy();
  
  ep.all(['prolist','userlist'],function(prolist,userlist){
    
    res.render('bugcreate.html',{page:page,prolist:prolist,userlist:userlist});
  });
  
  //取项目列表
  var mysqlpro = 'select ZID,ZNAME from TB_PRO_ITEM order by ZOPENDATE desc';
  Db.query(mysqlpro,function(err,rows){
    ep.emit('prolist',!err && rows ? rows : []);
  });
  
  //取出可用的用户
  var mysqluser = 'select ZID,ZNAME from TB_USER_ITEM where ZSTOP=0 order by ZNAME';
  Db.query(mysqluser,function(err,rows){
    ep.emit('userlist',!err && rows ? rows : []);
  });
  
  
});

router.get('/:ZID',function(req,res,next){
  var ZID = req.params.ZID;
  var page = req.query.page;
  
  var mysql = 'select * from TB_BUG_ITEM where ZID=' + ZID;
  Db.query(mysql,function(err,bugitem){
    if(!err){
      //查回复
      var mysql2 = 'select * from TB_BUG_HISTORY where ZBUG_ID= '+ ZID + 'order by ZACTIONDATE';
      Db.query(mysql2,function(err,bughistory){
        res.render('buginfo.html',{curbug:bugitem[0],
                                   curbughistory: !err && bughistory && bughistory.length>0 ? bughistory:[],
                                   page:page});  
      });
         
    }
    else{
      res.render('buginfo.html',{curbug:{},curbughistory:[],page:page}); 
    }
  });
  
  
});



module.exports = router; 