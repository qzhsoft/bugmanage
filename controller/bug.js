var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');

//创建新的bug
router.get('/create',function(req,res,next){
  var page = req.query.page;
  res.render('bugcreate.html',{page:page});
  
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