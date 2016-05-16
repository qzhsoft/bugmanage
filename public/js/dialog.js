 
define(function(require, exports, module){
  
  
  //
  // html : 1) path string
  //        2) html 对象
  //
  exports.init = function(html,id){
   
    var modal_html = [
      '<div class="modal fade"  tabindex="-1" role="dialog" aria-labelledby="myModalLabel">',
      '<div class="modal-dialog" role="document">',
      '<div class="modal-content dialogcontent">',
      '</div>',
      '</div>',
      '</div>'
    ];
    
    var myid = id || 'myDialogid';
    var script = [
      '<script>',
      '$("#myDialogid").on("hidden.bs.modal", function (e) {',
        '$("#myDialogid").remove();',
      '});', 
      '</script>'
    ];
    
    var  modal = $(modal_html.join(''));
    modal.attr('id',myid);
    
    if(typeof html == 'string'){
      var dialog_html = new EJS({url:html ,ext:'html'}).render();  
      modal.find('.dialogcontent').html(dialog_html);
    }
    else{
      modal.find('.dialogcontent').append(html);  
    };
    
    modal.append($(script.join('')));
    $('body').append(modal);
    
  };
  
  exports.open = function(html,id){
    var myid = id || 'myDialogid';
    exports.init(html,myid);
    $('#'+myid).modal();  
  };
  
  //
  //带有确定的窗口
  //
  exports.comfirm=function(html,id,cb){
   
    if(typeof id == 'function'){
      cb = id;
      id = 'myDialogid';
    };
    var myid = id || 'myDialogid';
    
    var modal_footer = [
      '<div class="modal-footer">',
        '<button type="button" class="btn btn-default" data-dismiss="modal" id="mycanlebtn">关闭</button>',
        '<button type="button" class="btn btn-primary" id="myyesbtn">确定</button>',
        '</div>'
    ];
    
    
    
    var script = [
      '<script>',
      '$(document).ready(function(){',
        '$("#myDialogid").on("click","#myyesbtn",function(){})',
      '})',  
      '</script>'
    ]
    
    exports.init(html,myid);
    var modal = $('#'+myid);
    modal.find('script').remove();
    modal.append($(script.join('')));
    if(modal.find('.modal-footer')){
     modal.find('.modal-footer').parent().remove('.modal-footer');     
    };
    
    modal.find('.dialogcontent').append($(modal_footer.join('')));
    $('#'+myid).modal(); 
    
    
  };
  
});
    
    
