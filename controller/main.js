var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');
var EventProxy = require('eventproxy');


router.get('/',function(req,res,next){
  
  var pageindex = req.query.page || 1;
  var curuserid = req.session.user.ZID;
  
  var curuserid = req.session.user.ZID;
  var ep = new EventProxy();
  

  ep.all('right',function(right){
    
    var mysql;
    
    var mywhere='1=1';
    //不是系统管理员时，则要列出bug的权限来。
    if(req.session.user.ZTYPE !=0){
      mywhere += ' and(';
      for(var i=0;i<right.length;i++){
        mywhere +=  (i>0?' or ':'') + 'ZTREE_ID=' + right[i].ZMODULEID; 
      };
      if(right.length==0){
        mywhere += ' ZTREE_ID=9999 )'  
      }
      else{
        mywhere += ')';
      };
    };
    
    if(pageindex==1){
      mysql = 'select top 20 ZID,ZTITLE,ZRESOLVEDBY from TB_BUG_ITEM where ' + mywhere +' order by ZOPENEDDATE desc ';
    }
    else{
      mysql = 'select TOP 20 ZID,ZTITLE,ZRESOLVEDBY from TB_BUG_ITEM where ' + mywhere +' and  ZID not in(' + 
                'select TOP ' + 20 * (pageindex -1) + ' ZID from TB_BUG_ITEM where ' + mywhere +' order by ZOPENEDDATE desc) order by ZOPENEDDATE desc ';
    };

    Db.query(mysql,function(err,data){
      if(!err){
        Db.query('select count(*) as myv from TB_BUG_ITEM where ' + mywhere ,function(err,count){
          res.render('main.html',{bugitems:data,
                                  msgbox:req.flash('msgbox'),
                                  rowcount:!err? count[0].myv : 0 ,
                                  curpageindex:pageindex});  
        });

      }
      else{
        res.render('main.html',{
          bugitems:[],
          msgbox:[{success:false,msg:'读取数据内的数据出错'+err}],
          rowcount:0,
          curpageindex:1});     
      }
    });
    
    
  });
        
  
  //取出权限来
  if(!req.session.user.bugright){
    var mysqlright = 'select ZMODULEID from TB_USER_PRIVILEGE where ZSTYLE=200 and ZSUBSTYLE=1 and ZUSER_ID=' + curuserid;
    Db.query(mysqlright,function(err,rows){
      if(!err && rows){
        req.session.user.bugright = rows;
        ep.emit('right',rows);
      }
    });
  }
  else{
    ep.emit('right',req.session.user.bugright);
  };
      
  
  
    
});

module.exports = router; 