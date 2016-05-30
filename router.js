var express = require('express');
var router = express.Router();

var hasloginuser = function(req,res,next){
    
    if(req.session.user){
      res.locals.curuser = req.session.user;
      next(); 
    }
    else{
      res.redirect('/login');
    }
};

//登录
var login = require('./controller/login.js');
router.use('/login',login);

//主窗口
router.use('/main',hasloginuser,require('./controller/main.js'));

//新建bug
router.use('/bug',hasloginuser,require('./controller/bug.js'));

//用户信息
router.use('/user',require('./controller/user.js'));

//svn日志
router.use('/svn',hasloginuser,require('./controller/svn.js'));

//ip
router.use('/ipaddress',require('./controller/ipaddress.js'));

//都没有找到，转到其他。
router.get('/', hasloginuser,function (req, res) {
  res.redirect('/main');
});



module.exports = router;