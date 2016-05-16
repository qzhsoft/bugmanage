var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');
var EventProxy = require('eventproxy');

//创建新的bug
router.get('/create',function(req,res,next){
  var page = req.query.page;
  
  var ep = new EventProxy();
  
  ep.all(['bugtree','userlist'],function(bugtree,userlist){
    
    res.render('bugcreate.html',
               {page:page,bugtree:bugtree,userlist:userlist});
  });
  
  //取项目列表
  var mysqlpro = 'select ZID,ZPRO_ID,ZPID,ZHASCHILD,ZNAME from TB_BUG_TREE where ZPID=-1 order by ZSORT ';
  Db.query(mysqlpro,function(err,rows){
    ep.emit('bugtree',!err && rows ? rows : []);
  });
  
  //取出可用的用户
  var mysqluser = 'select ZID,ZNAME from TB_USER_ITEM where ZSTOP=0 order by ZNAME';
  Db.query(mysqluser,function(err,rows){
    ep.emit('userlist',!err && rows ? rows : []);
  });
   
});

router.post('/create',function(req,res,next){
  
  
  
});


//
//取出bug的数据结构
//
router.get('/bugtree',function(req,res,next){
  var pid = req.query.pid;
  var mysqlpro = 'select ZID,ZPRO_ID,ZPID,ZHASCHILD,ZNAME from TB_BUG_TREE where ZPID=' + pid +' order by ZSORT ';
  Db.query(mysqlpro,function(err,rows){
    if(!err && rows){
      res.json({success:true,msg:'',tree:rows});  
    }
    else{
      res.json({success:false,msg:''});
    }
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
                                   ZID:ZID,
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