var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');

//退出
router.get('/logout',function(req,res,next){
  req.session.user = null;
  res.redirect('/login');
});

router.get('/',function(req,res,next){
  
  Db.query('select top 1 ZNAME from TB_TODAYSAY where ZSTOP=0 order by ZDATE desc',function(err,rows){
    res.render('login.html',{
      msgbox:req.flash('msgbox'),
      today:!err && rows && rows.length>0 ? rows[0].ZNAME : ''
    });  
  });
  
    
});

router.post('/',function(req,res,next){
    var myname = req.body.myname;
    var mypasswd = req.body.mypasswd;
    
    //db  
    var mysql = "select * from TB_USER_ITEM where ZNAME='" + myname +"' and ZPASS='"+ mypasswd +"'" ;
    Db.query(mysql,function(err,data){
      if(!err && data.length > 0 ){
        //类型=0系统用户,1=开发人员 2=测试人员,3=其他人员
        req.session.user = {name:myname,ZID:data[0].ZID,ZTYPE:data[0].ZTYPE};
        res.redirect('/main');  
      } 
      else{
        req.flash('msgbox',{success:false,msg:'账号或密码出错。'});
        res.redirect('/login');    
      }
    });
        
});






module.exports = router; 