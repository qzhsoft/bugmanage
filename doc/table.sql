/*
 * 扩展应用增加的表，与开发管理无关。
 * 作者：龙仕云
 */
 
 
/*公司的资源*/
create table ERP_IPADDRESS(
    ZGUID          varchar(36) not null,   /*GUID*/
	ZIP            varchar(30) ,           /*IP地址*/
    ZPARTNAME      varchar(100),           /*哪个部门*/
    ZTITLE         varchar(200),           /*说明*/
    ZTYPE          int not null,           /* =0 说明文本  1=IP 地址 */
    ZUSE           bit  default 0,         /* 1=已使用了*/
    ZWHOUSE        varchar(100),           /*谁点用了*/
    ZUSEDATE       date,                   /*申请时间*/
    ZMAC           varchar(100),           /*是否ip 绑定了*/
    ZIDX           int,                    /* ip 地址的最后一个，用于排序 */

	constraint PK_ERP_IPADDRESS primary key(ZGUID)
)
go 

create table ERP_IPADDRESS_ITEM(
  ZGUID          varchar(36) not null,    /* 主键*/
  ZIPGUID        varchar(36) not null,    /* 对应于 ERP_IPADDRESS 的值 */
  ZIP            varchar(30) ,            /* ip 的值 */
  ZUSEDATE       datetime,                /*申请时间*/
  ZWHOUSE        varchar(100),            /*申请人*/
  ZMAC           varchar(100),            /*申请绑定MAC*/
  ZPARTNAME      varchar(100),            /*申请人部门*/
  ZVERIFY        int default 0,           /*0=审核中， =1 表示审批过了 2=表示不过*/
  ZVERIFYUSERID  int,                     /* 检核人id*/
  ZVERIFYDATE    date,                    /* 检核人时间*/
  ZNOTE          varchar(250)             /* 备注 */
  
  constraint PK_ERP_IPADDRESS_ITEM primary key(ZGUID)
)
go




