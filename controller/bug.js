var express = require('express');
var router = express.Router();
var Db = require('../lib/db.js');
var EventProxy = require('eventproxy');
var util = require('util');
var fs = require('fs');
var config = require('../config.js');

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
  
  //取出参数
  var ZTREE_ID= req.body.ZTREE_ID;
  var ZPRO_ID = req.body.ZPRO_ID;
  var ZTITLE = req.body.ZTITLE;
  var ZASSIGNEDTO = req.body.ZASSIGNEDTO;
  var ZSUBASSIGNEDTO = req.body.ZSUBASSIGNEDTO; //从子派
  
  var page = req.query.page || 1;
  var curuserid = req.session.user.ZID;
  

  
  //先取出最大的ZID值。
  var mysqlmax = 'select max(ZID) + 1 as mymax from TB_BUG_ITEM ';
  Db.query(mysqlmax,function(err,rows){
    if(!err && rows && rows.length > 0){
     
      
      var mysqltxtfmt = "insert into TB_BUG_ITEM" + 
                 "(ZID,ZTREE_ID,ZPRO_ID,ZTREEPATH,ZTITLE,ZOS,ZLEVEL,ZSTATUS,ZOPENEDBY,ZOPENEDDATE,ZOPENVER,ZLASTEDITEDBY,ZLASTEDITEDDATE,ZASSIGNEDTO,ZSUBASSIGNEDTO,ZOVERFRACTION) values" +
                 "(%d ,%d      ,%d     ,'%s'     ,'%s'   ,0  ,0      ,0     ,%d       ,GETDATE()  ,0       ,%d           ,GETDATE()      ,%d         ,%d        ,0)";
      
      var mysqltxt = util.format(mysqltxtfmt,rows[0].mymax,
                  parseInt(ZTREE_ID),
                  parseInt(ZPRO_ID),
                  "",
                  ZTITLE,
                  curuserid,
                  curuserid,
                  ZASSIGNEDTO || null,
                  ZSUBASSIGNEDTO || null               
                 );
      
      //执行sql值了。写入数据库
      Db.exec(mysqltxt,function(err){
        if(!err){
          res.redirect('/main?page='+page);  
        }
        else{
          req.flash('msgbox',{success:false,msg:'写入数据库出错。'});
          res.redirect('/main?page='+page);    
        }
      });
      
      
      
    }
    else{
      req.flash('msgbox',{success:false,msg:'无法提出最大的ZID值。'});
      res.redirect('/main?page='+page);
    }
  });
  
  
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

//
//bug内容回复
//
router.post('/reply',function(req,res,next){
  
  var bugid = req.body.bugid;
  var content = req.body.replycontent; //回复内容
  var page = req.query.page || 1;
  
  var curuserid = req.session.user.ZID;
  
  //写入库内
  var mysqlfrm = "insert into TB_BUG_HISTORY" + 
                 "(ZBUG_ID,ZUSER_ID,ZSTATUS,ZACTIONDATE,ZCONTEXT) values"+
                 "(%d,%d,0,GETDATE(),'%s')";
  var mysqltxt = util.format(mysqlfrm,parseInt(bugid),curuserid,content);

  Db.exec(mysqltxt,function(err){

    if(!err){
      res.redirect('/bug/'+bugid+'?page='+page);   
    }
    else{
      req.flash('msgbox',{success:false,msg:'保存到库内出错。'+err.message});
      res.redirect('/bug/'+bugid+'?page='+page);  
    }

  });
  
  
  //可能会有基本资料修改
  var ZTITLE = req.body.ZTITLE;
  var ZASSIGNEDTO = req.body.ZASSIGNEDTO;
  var ZSUBASSIGNEDTO = req.body.ZSUBASSIGNEDTO; //从子派
  
  if(ZTITLE){
    var mysqltxtfrm2 = "update TB_BUG_ITEM set ZTITLE='%s',ZASSIGNEDTO=%d,ZSUBASSIGNEDTO=%d,ZLASTEDITEDBY=%d,ZLASTEDITEDDATE= GETDATE() where ZID=%d";
    var mysqltxt2 = util.format(mysqltxtfrm2,ZTITLE,ZASSIGNEDTO||0,ZSUBASSIGNEDTO||0,curuserid,bugid);
    Db.exec(mysqltxt2);
  }else{
    var mysqltxtfrm2 = "update TB_BUG_ITEM set ZLASTEDITEDBY=%d,ZLASTEDITEDDATE= GETDATE() where ZID=%d";
    var mysqltxt2 = util.format(mysqltxtfrm2,curuserid,bugid);
    Db.exec(mysqltxt2);
  }
  
  
});

//
//bug解决了
//
router.post('/closed',function(req,res,next){
  
  var bugid = req.body.bugid;
  var content = req.body.replycontent; //回复内容
  var page = req.query.page || 1;
  var curuserid = req.session.user.ZID;
  
  var ep = new EventProxy();
  
  ep.all(['history','bug'],function(history,bug){
    if(bug==true && history == true){
      res.redirect('/bug/'+bugid+'?page='+page);   
    }
    else{
      req.flash('msgbox',{success:false,msg:'保存到库内出错。'});
        res.redirect('/bug/'+bugid+'?page='+page);    
    }
  });
  
  
  
  //写回复库
  var mysqlfrm = "insert into TB_BUG_HISTORY" + 
                 "(ZBUG_ID,ZUSER_ID,ZSTATUS,ZACTIONDATE,ZCONTEXT) values"+
                 "(%d,%d,%d,1,GETDATE(),'%s')"; //1=解决了
  var mysqltxt = util.format(mysqlfrm,parseInt(bugid),curuserid,content);

  Db.exec(mysqltxt,function(err){
    ep.emit('history',!err?true:false);
  });
  
  
  //更新bug表
  var mysqltxtfrm2 = "update TB_BUG_ITEM set ZRESOLVEDBY=%d,ZRESOLVEDDATE=GETDATE(),ZLASTEDITEDBY=%d,ZLASTEDITEDDATE=GETDATE() where ZID=%d";
  var mysqltxt2 = util.format(mysqltxtfrm2,curuserid,curuserid,bugid);
  Db.exec(mysqltxt2,function(err){
    ep.emit('bug',!err?true:false);  
  });
  
});

//
//重新激活问题
//
router.post('/opened',function(req,res,next){
  
  var bugid = req.body.bugid;
  var content = req.body.replycontent; //回复内容
  var page = req.query.page || 1;
  var curuserid = req.session.user.ZID;
  
  var ep = new EventProxy();
  
  ep.all(['history','bug'],function(history,bug){
    if(bug==true && history == true){
      res.redirect('/bug/'+bugid+'?page='+page);   
    }
    else{
      req.flash('msgbox',{success:false,msg:'保存到库内出错。'});
        res.redirect('/bug/'+bugid+'?page='+page);    
    }
  });
  
  
  
  //写回复库
  var mysqlfrm = "insert into TB_BUG_HISTORY" + 
                 "(ZID,ZBUG_ID,ZUSER_ID,ZSTATUS,ZACTIONDATE,ZCONTEXT) values"+
                 "(%d,%d,%d,2,GETDATE(),'%s')"; //1=解决了
  var mysqltxt = util.format(mysqlfrm,rows[0].mymax,parseInt(bugid),curuserid,content);

  Db.exec(mysqltxt,function(err){
    ep.emit('history',!err?true:false);
  });
  
  
  //更新bug表
  var mysqltxtfrm2 = "update TB_BUG_ITEM set ZRESOLVEDBY=null,ZRESOLVEDDATE=GETDATE(),ZLASTEDITEDBY=%d,ZLASTEDITEDDATE=GETDATE() where ZID=%d";
  var mysqltxt2 = util.format(mysqltxtfrm2,curuserid,bugid);
  Db.exec(mysqltxt2,function(err){
    ep.emit('bug',!err?true:false);  
  });
  
  
  
});


//
//bug 附件的下载
//
router.get('/attach/:GUID/:name',function(req,res,next){
  var localguid = req.params.GUID;
  var filepath = config.attachdir + '/' + localguid;
  
  fs.readFile(filepath,function(err,stream){
    if(!err){
      res.set('Content-Type', 'application/octet-stream');
      res.status(200).send(stream); 
    }
    else{
      res.status(404).send('Sorry, not find that!'+err);   
    }    
  });
  
});

//
//bug 的信息
//
router.get('/:ZID',function(req,res,next){
  var ZID = req.params.ZID;
  var page = req.query.page;
  
  var mysql = 'select *,CONVERT(varchar(100), ZOPENEDDATE, 20) as myod,CONVERT(varchar(100), ZRESOLVEDDATE, 20) as myrd from TB_BUG_ITEM where ZID=' + ZID;
  Db.query(mysql,function(err,bugitem){
    if(!err){
      
      var ep = new EventProxy();
      
      ep.all(['history','treename','attach'],function(history,treename,attach){
        
        res.render('buginfo.html',{curbug:bugitem[0],
                                   ZID:ZID,
                                   msgbox:req.flash('msgbox'),
                                   curbughistory: history,
                                   treename:treename,
                                   attachlist:attach,  //附件列表
                                   page:page});    
      });
      
      
      //查回复
      var mysql2 = 'select *,CONVERT(varchar(100), ZACTIONDATE, 20) as myd from TB_BUG_HISTORY where ZBUG_ID= '+ ZID + 'order by ZACTIONDATE';
      Db.query(mysql2,function(err,bughistory){
        ep.emit('history',!err && bughistory && bughistory.length>0 ? bughistory:[]);
      });
      
      //查项目名称
      var mysql3 = 'select ZNAME,ZPID from TB_BUG_TREE where ZID=' + bugitem[0].ZTREE_ID;
      Db.query(mysql3,function(err,tree){
        if(!err && tree && tree.length>0 && tree[0].ZPID >0){
         
          var mysql4 = 'select ZNAME from TB_BUG_TREE where ZID=' + tree[0].ZPID;
          Db.query(mysql4,function(err,ptree){
            ep.emit('treename',(!err && ptree && ptree.length>0 ? ptree[0].ZNAME:'') + '/' + tree[0].ZNAME);  
          });
          
        }
        else{
          ep.emit('treename',!err && tree && tree.length>0 ? tree[0].ZNAME:'');
        }
      });
      
      //取出bug的附件
      
      var mysqltxt3_frm = 'select a.*,b.ZLOCALGUID from  TB_FILE_ITEM as a ,TB_FILE_CONTEXT as b where a.ZCONTENTID=%d and a.ZSTYPE=1 and a.ZID = b.ZFILE_ID  Order by a.ZEDITDATETIME';
      var mysqltxt3 = util.format(mysqltxt3_frm,bugitem[0].ZID);
      Db.query(mysqltxt3,function(err,rows){
        ep.emit('attach',!err && rows ? rows:[]);    
      });
    }
    else{
      res.render('buginfo.html',{curbug:{},curbughistory:[],page:page}); 
    }
  });
});



module.exports = router; 