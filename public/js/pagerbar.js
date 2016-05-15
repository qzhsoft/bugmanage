define(function(require, exports, module){
 
  
  exports.init=function(elem,rowcount,curpageindex,href){
    
    
    var nav_html = [
      '<nav>',
        '<ul class="pagination">',
          '<li>',
            '<a href="#" aria-label="Previous">',
              '<span aria-hidden="true">&laquo;</span>',
            '</a>',
          '</li>',
          
          '<li>',
            '<a href="#" aria-label="Next">',
              '<span aria-hidden="true">&raquo;</span>',
            '</a>',
          '</li>',
        '</ul>',
      '</nav>' 
    ];
    
   var nav = $(nav_html.join(''));
   var href = href || '';
   
    var pagecount = parseInt(rowcount/20);
    
    nav.find('li:first>a').attr('href',href.replace(/\$\$/g,1));
    nav.find('li:last>a').attr('href',href.replace(/\$\$/g,pagecount));
    if(pagecount > 5){
      var buttoncount = 2;
      //当前页面的前二页
      if(curpageindex-2>0){
        var num = curpageindex-2;
        var li = $('<li></li>');
        var a = $('<a></a>').text(num);
        a.attr('href',href.replace(/\$\$/g,num));
        li.append(a);  
        nav.find('li:last').before(li); 
        buttoncount--;
      };
      
      
      //当前页面的前-页
      if(curpageindex-1>0){
        var num = curpageindex-1;
        var li = $('<li></li>');
        var a = $('<a></a>').text(num);
        a.attr('href',href.replace(/\$\$/g,num));
        li.append(a);  
        nav.find('li:last').before(li);   
        buttoncount--;
      };
      
      //显示当前页面
      var li = $('<li class="active"></li>');
      var a = $('<a></a>').text(curpageindex);
      li.append(a);  
      nav.find('li:last').before(li);
      
      
      //当前页后一页
      if(curpageindex+1<pagecount){
        var num = curpageindex+1;
        var li = $('<li></li>');
        var a = $('<a></a>').text(num);
        a.attr('href',href.replace(/\$\$/g,num));
        li.append(a);   
        nav.find('li:last').before(li);  
      };
      
      if(curpageindex+2<pagecount){
        var num = curpageindex+2;
        var li = $('<li></li>');
        var a = $('<a></a>').text(num);
        a.attr('href',href.replace(/\$\$/g,num));
        li.append(a);    
        nav.find('li:last').before(li);     
      };
      
      var j = 2;
      for(; buttoncount>0;){
        
        if(curpageindex+j+1<pagecount){
          var num = curpageindex+j+1;
          var li = $('<li></li>');
          var a = $('<a></a>').text(num);
          a.attr('href',href.replace(/\$\$/g,num));
          li.append(a);   
          nav.find('li:last').before(li);     
        };
        j++;
        buttoncount--;
      }
      
      //页共数
      var span = $('<span></span>').text('共 ' + pagecount + ' 页 ' + rowcount + '条记录'); 
      nav.find('ul').append($('<li></li>').addClass('disabled').append(span));
      
    }
    else{
      for(var i=0;i<pagecount;i++){
        var li = $('<li></li>');
        var a = $('<a></a>').text(i+1);
        li.append(a);  
        nav.find('li:last').before(li);
      }
    };
    

   $(elem).append(nav);
  }
  
  
});

//'<li><a href="#">1</a></li>',
//          '<li><a href="#">2</a></li>',
//          '<li><a href="#">3</a></li>',
//          '<li><a href="#">4</a></li>',
//          '<li><a href="#">5</a></li>',

 
                    