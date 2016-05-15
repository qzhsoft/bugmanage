
var express = require('express');
var app = express();
var ejs = require('ejs');
var path = require('path');
var session = require('express-session');

var bodyparse = require('body-parser');


app.set('views',path.join(__dirname,'./views'));
app.set('view engine','html');
app.engine('html',ejs.renderFile);
app.use(express.static(__dirname+'/public',{maxAge:86400000}));

app.use(bodyparse());
app.use(session({
    name:"myapp",
    secret:'123',
    key:'mrlong',
    cookie:{secure:false,secure: false,maxAge: 1000 * 60 * 60 * 24 * 1}
}));


var router = require('./router.js');
app.use(router);


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});