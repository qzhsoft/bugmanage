
var Connection = require('tedious').Connection;
var config = {
    userName: 'sa',
    password: 'qzh123',
    server: '192.168.1.250',
    
    // If you're on Windows Azure, you will need this:
    options: {database:'BFSS',encrypt: false}
  };



var connection = new Connection(config);

  connection.on('connect', function(err) {
    
    if (err != null) {
      console.error('Received error', err);
    } else {
      console.log('Now connected, can start using');
    };
    
  });


//conn.connect(function(error) {
//  if (error != null) {
//    console.error('Received error', error);
//  } else {
//    console.log('Now connected, can start using');
//    
//    var stmt = conn.createStatement('select * from TB_BUG_TREE');
//    stmt.on('row', function(row) {
//      console.log('Received row: ', row.getValue(0));
//      conn.end();
//    });
//    stmt.execute();
//  }
//});

