
//图片放大  
$(function(){  

$("#outerdiv").hide();

$("img").mouseover(function(){
	$(this).css("cursor","pointer");
});

$("img").click(function(){  
	var _this = $(this);//将当前的pimg元素作为_this传入函数    
	imgShow("#outerdiv", "#bigimg", _this);    
  });

$("#outerdiv").click(function(){//再次点击淡出消失弹出层    
		$(this).fadeOut("fast");    
  });   	  
});    

function imgShow(outerdiv, bigimg, _this){  
	var src = _this.attr("src");//获取当前点击的pimg元素中的src属性    
	$('#outerdiv').attr('display','block');  
	$(bigimg).attr("src", src);//设置#bigimg元素的src属性    
	 $(outerdiv).fadeIn("fast");  
}   
