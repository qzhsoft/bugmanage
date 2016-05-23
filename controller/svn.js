var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');
var EventProxy = require('eventproxy');


var get_index = function(req,res,next){
  
  var page = req.query.page || 1;
  
  var mysqltxt;
  if(page == 1){
    mysqltxt = 'select top 20 * ,CONVERT(varchar(100), ZDATE, 20) as myd from TB_SVN_COMMITS order by ZDATE desc ';
  }
  else{
    mysqltxt = 'select top 20 *,CONVERT(varchar(100), ZDATE, 20) as myd from TB_SVN_COMMITS where ZID not in( ' + 
                'select top ' + 20 * (page -1) + ' ZID from TB_SVN_COMMITS order by ZDATE desc  )  order by ZDATE desc ';    
  };
  
  
  Db.query(mysqltxt,function(err,rows){
    
    Db.query('select count(*) as myc from TB_SVN_COMMITS',function(err2,rows2){
       res.render('svn.html',{
         svnitems:!err && rows ? rows : [],
         rowcount : !err2 && rows2 && rows2.length > 0 ? rows2[0].myc : 0,
         curpageindex : page
       });   
    });
   
  });
  
};

var get_change = function(req,res,next){
  var zsvn_guid = req.query.zsvn_guid;
  var zversion = req.query.zversion;
  
  
  var mysqltxt = "select * from TB_SVN_CHANGES where ZSVN_GUID='" + zsvn_guid + "' and zversion=" + zversion ;
  Db.query(mysqltxt,function(err,rows){
    if(!err){
      res.json({success:true,msg:'',rows:rows});  
    }
    else{
      res.json({success:false,msg:err.message,rows:rows});
    }
  });
}


router.get('/change',get_change);
router.get('/',get_index);

module.exports = router; 