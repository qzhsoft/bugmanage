/*
 * ip 地址显示。
 *
 */

var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');
var EventProxy = require('eventproxy');
var util = require('util');

var get_index = function(req,res,next){
  var mysqltxt = 'select a.*,CONVERT(varchar(100), a.ZUSEDATE, 20) as myd,b.ZWHOUSE as BZWHOUSE,b.ZMAC as BZMAC ,b.ZNOTE as BZNOTE,b.ZVERIFY from ERP_IPADDRESS as a left join (select * from ERP_IPADDRESS_ITEM where ERP_IPADDRESS_ITEM.ZVERIFY=0) as b  on ( a.ZGUID=b.ZIPGUID )  order by ZIDX';
  Db.query(mysqltxt,function(err,rows){
    
    res.render('ipaddress.html',{
      ips: !err ? rows : [] ,
      admin:req.session.user && req.session.user.ZTYPE ==0
    });
    
    
  });
  
  
};

var guid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
};


var post_addip = function(req,res,next){
  
  var ip = req.body.ip;
  var partname = req.body.partname;
  
  var iplist = [];
  var ips = ip.split('~');
  if(ips.length==1){
    iplist.push(ips[0]);  
  }
  else if (ips.length == 2){
    iplist.push(ips[0]);
    var s = ips[0].split('.');
    for(var i= parseInt(s[3])+1;i<=parseInt(ips[1]);i++){
      var ss = s[0] + '.' + s[1] + '.' + s[2] + '.' + i;
      iplist.push(ss);
    }
  };
  
  
  for(var i=0;i<iplist.length;i++){
    var myip = iplist[i];
    var myguid = guid();
    var mysqltxt_frm = "insert into ERP_IPADDRESS(ZGUID,ZIP,ZPARTNAME,ZTYPE,ZIDX) values('%s','%s','%s',1,%d)";
    var s = myip.split('.');
    var mysqltxt = util.format(mysqltxt_frm,myguid,myip,partname,parseInt(s[3]));
    Db.query(mysqltxt,function(err){
      err && console.error(err);
    });
  };
  
  
  res.redirect('/ipaddress');
    
  
};


var post_repip = function(req,res,next){
  var ZWHOUSE = req.body.ZWHOUSE;         //谁
  var ZPARTNAME = req.body.ZPARTNAME;     //哪个部门
  var ZIPGUID = req.body.ZIPGUID;
  var ZIP = req.body.ZIP;
  var ZNOTE = req.body.ZNOTE;  //说明
  
  //现在写库了。
  var myguidn= guid();
  var mysqlfrm = "insert into ERP_IPADDRESS_ITEM(ZGUID,ZIPGUID,ZIP,ZUSEDATE,ZWHOUSE,ZPARTNAME,ZNOTE) values" +
                 "('%s','%s','%s',GETDATE(),'%s','%s','%s')";
  var mysqltxt = util.format(mysqlfrm,myguidn,ZIPGUID,ZIP,ZWHOUSE,ZPARTNAME,ZNOTE);
  
  Db.query(mysqltxt,function(err){
    res.json({success:!err,msg:err});
  });
  
  
};

//谁在用ip
var get_whouseip = function(req,res,next){
  var ZIPGUID = req.query.ZIPGUID;
  var mysqlfrm = "select *,CONVERT(varchar(100), a.ZUSEDATE, 20) as myd,b.ZNAME as VERNAME, CONVERT(varchar(100), a.ZVERIFYDATE, 20) as mydd from ERP_IPADDRESS_ITEM as a left join TB_USER_ITEM as b on(a.ZVERIFYUSERID=b.ZID) where ZIPGUID='%s' order by ZUSEDATE desc ";
  var mysqltxt = util.format(mysqlfrm,ZIPGUID);
  Db.query(mysqltxt,function(err,rows){
    res.json({success:!err,msg:'',rows:!err && rows ? rows : []});
  });
};

var get_useip = function(req,res,next){
  var ZGUID = req.params.guid;
  var ZIPGUID = req.params.ipguid;
  if(!req.session.user){
    res.header("Content-Type", "application/json; charset=utf-8");
    res.end('你没有登录擎洲开发管理系统，只要有权限登录谁能可以审批使用。');
    return false;
  };
  
  var mysqlfrm = "update  ERP_IPADDRESS_ITEM set ZVERIFYUSERID=%d,ZVERIFYDATE=GETDATE(),ZVERIFY=1 where ZGUID='%s' and ZIPGUID = '%s'";
  var mysqltxt = util.format(mysqlfrm,req.session.user.ZID,ZGUID,ZIPGUID);
  
  Db.query(mysqltxt,function(err){
    if(!err){
      //回写对应的主表
      var mysqlfrm  = "select * from ERP_IPADDRESS_ITEM where ZGUID='%s' and ZIPGUID = '%s'  ";
      var mysqltxt = util.format(mysqlfrm,ZGUID,ZIPGUID);
      Db.query(mysqltxt,function(err,rows){
        if(!err && rows && rows.length>0){
          var mysqlfrm = "update ERP_IPADDRESS set ZWHOUSE='%s', ZUSE=1,ZUSEDATE=GETDATE(),ZMAC='%s',ZTITLE='%s' where ZGUID='%s'";
          var mysqltxt = util.format(mysqlfrm,rows[0].ZWHOUSE,rows[0].ZMAC,rows[0].ZNOTE,ZIPGUID);
          Db.query(mysqltxt,function(err){
            
            if(!err){
              res.header("Content-Type", "application/json; charset=utf-8");
              res.status(200).end('审核成功成功，请到路由器进行配置如你不是网管请主动与网管联系。');
            }
            else{
              res.header("Content-Type", "application/json; charset=utf-8");
             res.status(404).end('写错出错,并数据不完整请重新申请');
            }
            
          });
        }
        else{
          res.header("Content-Type", "application/json; charset=utf-8");
          res.status(404).end('写错出错,并数据不完整请重新申请');  
        }
      });
    }
    else{
      res.header("Content-Type", "application/json; charset=utf-8");
      res.status(404).end('写库出错');
    }
  });
  
};

var get_blackip = function(req,res,next){
  
  var ZIPGUID = req.params.ipguid;
  var EventProxy = require('eventproxy');
  
  if(!req.session.user){
    res.header("Content-Type", "application/json; charset=utf-8");
    res.end('你没有登录擎洲开发管理系统，只要有权限登录谁能可以操作。');
    return false;
  };
  
  ep = new EventProxy();
  
  ep.all('ipaddress',function(ipaddress){
  
    if(!ipaddress){
      res.header("Content-Type", "application/json; charset=utf-8");
      res.status(404).end('读取IP信息出错'); 
      return false;
    };
      
    var mysqlfrm = "update ERP_IPADDRESS set ZWHOUSE=NULL, ZUSE=0,ZUSEDATE=NULL,ZMAC=NULL,ZTITLE=NULL where ZGUID='%s'";
    var mysqltxt = util.format(mysqlfrm,ZIPGUID);
  
    Db.query(mysqltxt,function(err){

      if(!err){
        var myguid =guid(); 
        //更新日志库。
        var mysqlfrm = "insert into ERP_IPADDRESS_ITEM(ZGUID,ZIPGUID,ZNOTE,ZUSEDATE,ZWHOUSE,ZPARTNAME,ZVERIFY,ZVERIFYUSERID) values" +
                   "('%s','%s','%s',GETDATE(),'%s','%s',1,%d)";
        var mysqltxt = util.format(mysqlfrm,
                                   myguid,
                                   ZIPGUID,
                                   '回收IP:' + ipaddress.ZIP ,
                                   ipaddress.ZWHOUSE,
                                   ipaddress.ZPARTNAME,
                                   req.session.user.ZID);
        
        Db.query(mysqltxt,function(err){
          if(!err){
            res.header("Content-Type", "application/json; charset=utf-8");
            res.status(200).end('回收成功');   
          }
          else{
            res.header("Content-Type", "application/json; charset=utf-8");
            res.status(404).end('写库，并生数据不一致（只是日志没有)'); 
          }
        });

      }
      else{
        res.header("Content-Type", "application/json; charset=utf-8");
        res.status(404).end('写库出错');  
      }

    });
    
    
  });
  
  
  var mysqltxt = "select * from ERP_IPADDRESS where ZGUID='" + ZIPGUID + "'";
  Db.query(mysqltxt,function(err,rows){
    ep.emit('ipaddress',!err && rows && rows.length>0 ? rows[0]: null);
  });
  
  
  
  
  
};

router.post('/repip',post_repip);//申请ip
router.post('/addip',post_addip);
router.get('/useip/:guid/:ipguid',get_useip); //可以使用
router.get('/blackip/:ipguid',get_blackip);//回收ip
router.get('/whouseip',get_whouseip); //取出谁在用
router.get('/',get_index);



module.exports = router; 