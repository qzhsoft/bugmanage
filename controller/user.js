var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');


router.get('/info/:userid',function(req,res,next){
  var userid = req.params.userid;
  var mysql = 'select ZNAME from TB_USER_ITEM where ZID=' + userid;
  
  Db.query(mysql,function(err,user){
    if(!err && user){
      res.json({success:true,msg:'',user:user[0]});
    }
    else{
      res.json({success:false,msg:'查无用户'});
    }
  });
});


module.exports = router; 