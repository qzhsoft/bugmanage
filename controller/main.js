var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');


router.get('/',function(req,res,next){
  
  var pageindex = req.query.page || 1;
  var mysql;
  if(pageindex==1){
    mysql = 'select top 20 ZID,ZTITLE,ZRESOLVEDBY from TB_BUG_ITEM order by ZOPENEDDATE desc ';
  }
  else{
    mysql = 'select TOP 20 ZID,ZTITLE,ZRESOLVEDBY from TB_BUG_ITEM where ZID not in(' + 
              'select TOP ' + 20 * (pageindex -1) + ' ZID from TB_BUG_ITEM order by ZOPENEDDATE desc) order by ZOPENEDDATE desc ';
  };
  
  Db.query(mysql,function(err,data){
    if(!err){
      Db.query('select count(*) as myv from TB_BUG_ITEM',function(err,count){
        res.render('main.html',{bugitems:data,
                                rowcount:!err? count[0].myv : 0 ,
                                curpageindex:pageindex});  
      });
      
    }
    else{
      res.render('main.html',{bugitems:[]});     
    }
  });
  
    
});

module.exports = router; 