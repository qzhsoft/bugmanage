var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');


router.get('/',function(req,res,next){
  
    res.render('login.html',{myname:'long'});
    
});

router.post('/',function(req,res,next){
    var myname = req.body.myname;
    var mypasswd = req.body.mypasswd;
    
    //db  
    var mysql = "select * from TB_USER_ITEM where ZNAME='" + myname +"' and ZPASS='"+ mypasswd +"'" ;
    Db.query(mysql,function(err,data){
      if(!err && data.length > 0 ){
        req.session.user = {name:myname,ZID:data[0].ZID};
        res.redirect('/main');  
      } 
      else{
        res.redirect('/login');    
      }
    });
        
});




module.exports = router; 