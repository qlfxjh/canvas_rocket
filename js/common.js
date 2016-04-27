// JavaScript Document

function tab_mod(id,fun){
	var lis = $('#'+id+' li').click(tab_shift);
	function tab_shift(){
		for(var i=0; i<lis.length; i++){
			if(lis[i]!=this){
				$(lis[i]).removeClass('current');
				$('#tab_con_'+id.toString().substring(8)+'_'+(i+1)).css('display','none');
			}else{
				$(lis[i]).addClass('current');
				$('#tab_con_'+id.toString().substring(8)+'_'+(i+1)).css('display','block');
				if(fun){fun(i)};
			}
			
		}
	
		
	}
	this.shiftTo = function(index){
		for(var i=0; i<lis.length; i++){
			if(i!=index){
				$(lis[i]).removeClass('current');
				$('#tab_con_'+id.toString().substring(8)+'_'+(i+1)).css('display','none');
			}else{
				$(lis[i]).addClass('current');
				$('#tab_con_'+id.toString().substring(8)+'_'+(i+1)).css('display','block');
				if(fun){fun(i)};
			}
			
		}
	}
}

function tabShift(e, tabNav, preIdStr){
	///*第一个参数为event;*/
	///*第二个参数为this;*/
	///*第三个参数为tav_con的id前缀，如果为空，表示不通过id来获取tab_con,而是通过寻找tab_nav的同一个父亲元素下的class="tab_con"来获取tab_con对象;*/
	$tabNav = $(tabNav);
	var lis = $tabNav.find("li");
	var target = window.event?event.srcElement:e.target;
	var tabCons;
	//获取到当前点击的li
	try
	{
		while(target.tagName!="LI"||target == document.body){
			target = target.parentNode;
		}
	}
	catch(err){
		
	};
	
	if(target==document.body){
		return;
	}
	
	var idx = lis.index(target);
	if(tabNav.tagName=="UL"){
		tabCons = $(tabNav).parent().siblings(".tab_con");
	}else{
		tabCons = $(tabNav).siblings(".tab_con");
	}
	
	//切换tab_con
	if(arguments.length>2){
		//通过id来获取tab_con
		for(var i=0; i<lis.length; i++){
			if(i==idx){
				$("#"+preIdStr+(i+1)).show();
			}else{
				$("#"+preIdStr+(i+1)).hide();
			}
		}
	}else{
		tabCons.hide().eq(idx).show();
	}
	
	//切换tab_nav li当前项
	lis.removeClass("current").eq(idx).addClass("current");
}

function tabShiftSet(ulId, consIdPre, index){
	var ul = $("#"+ulId);
	var lis = ul.find("li");
	var currentLi = lis.filter("li.current");
	var oldIndex = lis.index(currentLi);
	var newIndex;
	if(index=="+1"){
		newIndex=oldIndex+1;
	}else if(index=="-1"){
		newIndex = oldIndex-1;
	}else{
		newIndex = index;
	}
	
	if(newIndex>lis.length-1){
		newIndex=lis.length-1
	}else if(newIndex<0){
		newIndex = 0;
	}
	lis.removeClass("current").eq(newIndex).addClass("current");
	//通过id来获取tab_con
	for(var i=0; i<lis.length; i++){
		if(i==newIndex){
			$("#"+consIdPre+(i+1)).show();
		}else{
			$("#"+consIdPre+(i+1)).hide();
		}
	}
	
	
	
	
}

function myMarquee(_id,_mode,_speed,_w,_h)
{	
	var ID=_id;
	var mode=_mode; 
	var speed=_speed*100;
	var txt=$('#'+_id).html();
	var width=_w;
	var height=_h;
	var lineHeight = 24;
	var finalTop=0;
	var index = 0;
	var marginBottom = 0;
	
	var handle;
	var s='<div id="'+_id+'_content" style="overflow: hidden;height:'+_h+'px;width:'+_w+'px;"><div id="'+_id+'_show" >'+txt+'</div><div id="'+_id+'_hide"></div></div>'
	$('#'+_id).html(s);	
	var list_show = $('#'+ID+'_show')[0];
	var list_hide = $('#'+ID+'_hide')[0];
	var list_content = $('#'+ID+'_content')[0];
	var lis = $(list_show).find('li');
	
	function doing()
	{
	    //  alert(ID)
		  switch(mode) {
		   case 't':
		   	if(lis.length>index){
				lineHeight = lis[index].offsetHeight + marginBottom;
				index++;
			}else if(lis.length>0){
				index = 0;
				lineHeight = lis[index].offsetHeight + marginBottom;
				index++;
			}
			if(list_hide.offsetTop-list_content.scrollTop<=0){
			 	finalTop = finalTop - list_show.offsetHeight;
			 	list_content.scrollTop = finalTop;
			 	finalTop = parseInt(finalTop)+parseInt(lineHeight);
			}else{
				finalTop = parseInt(finalTop)+parseInt(lineHeight);
			}
			setTimeout(slide,40);
			break;
		   case 'b':
			if(list_show.offsetTop-list_content.scrollTop>=0){
				list_content.scrollTop+=list_hide.offsetHeight
			}else{
			 	list_content.scrollTop-=lineHeight;
			}
			break;
		  }
	 }
	 var slide = function(){
		 var moveDis = parseInt((finalTop-parseInt(list_content.scrollTop))/2);
		 if(moveDis<1){
			list_content.scrollTop = finalTop;
		}else{
			list_content.scrollTop = parseInt(list_content.scrollTop) + moveDis;
			setTimeout(slide, 40);
		}
		
		
		
	}
	 var run = function(){
		list_content.scrollTop = 0;
		list_hide.innerHTML=list_show.innerHTML;
		//var temp='mymarquee'+ID+'=setInterval(\'doing("'+mode+'","'+ID+'")\','+speed+')'	
		handle = setInterval(doing,speed);

		var _id=ID;
		var _mode=mode;
		var _speed=speed;
		$("#"+ID+" ul").css('float','left');
		$(list_hide).css('clear','both');
		$(list_show).css('overflow','hidden');
		if(lis.length>0){
			if($.browser.msie){
				marginBottom = parseInt(lis[0].currentStyle.marginBottom);
			}else{
				marginBottom = parseInt(document.defaultView.getComputedStyle(lis[0],null).marginBottom);
			}
		}
		list_content.onmouseover=function() 
			{
				clearInterval(handle);
				handle = "";
			}		
		list_content.onmouseout=function() 
			{
				if(handle==""){
					handle = setInterval(doing,speed);
				}
			}
	}
	run();
}
/*页面弹层的JS*/
function Pop(){
	var popbox, wrap, bg, bg02;
	var init = function(){
		var frag = document.createDocumentFragment();
		wrap = document.createElement('DIV');
		wrap.id = "pop_wrapper";
		frag.appendChild(wrap);
		bg = document.createElement('DIV');
		bg.id = "pop_over_bg";
		frag.appendChild(bg);
		bg02 = document.createElement('iframe');
		bg02.id = "iframe_over_bg";
		bg02.src = "javascript:false";
		bg02.setAttribute("frameborder","0");
		frag.appendChild(bg02);
		document.body.appendChild(frag);
		
	}
	this.show = function(id){
		popbox = document.getElementById(id);
		wrap.appendChild(popbox);
		bg.style.display = "block";
		bg02.style.display = "block";
		popbox.style.display = "block";
		wrap.style.display = "block";
		wrap.style.width = popbox.offsetWidth +'px';
		wrap.style.height = popbox.offsetHeight +'px';
		wrap.style.marginLeft = -1*(popbox.offsetWidth/2)+"px";
	}
	this.close = function(){
		bg.style.display = "none";
		popbox.style.display = "none";
		wrap.style.display = "none";
		bg02.style.display = "none";
		wrap.removeChild(popbox);
		document.body.appendChild(popbox);
	}
	init();
}

/*页面中气泡弹层的样式*/
function bubbleAlert(txt){
	var t = txt?txt:' ';
	var d = document.createElement('DIV');
	d.className = "bubble_pop";
	d.innerHTML = '<span class="bub_success">'+ t +'</span>';
	
	
	var init = function(){
		document.body.appendChild(d);
		$(d).fadeIn(160);
		setTimeout(hide,2000);
	}
	var hide = function(){
		$(d).hide(160);
		setTimeout(remove,1000);
	}
	var remove = function(){
		$(d).remove();
	}
	init();
}

/*页面中气泡弹层的样式*/
function bubbleWrong(txt){
	var t = txt?txt:' ';
	var d = document.createElement('DIV');
	d.className = "bubble_pop";
	d.innerHTML = '<span class="bub_fail">'+ t +'</span>';
	
	var init = function(){
		document.body.appendChild(d);
		$(d).fadeIn(160);
		setTimeout(hide,2000);
	}
	var hide = function(){
		$(d).hide(160);
		setTimeout(remove,1000);
	}
	var remove = function(){
		$(d).remove();
	}
	init();
}

//通用自定义confirm 弹出层
function oFedConfirm(){
	var id = 'pop_fed_common_confirm';
	var returnSureFunc;
	var returnFalseFunc;
	var eTit;
	var sTit;
	var eCon;
	var sCon;
	var eBtnSure;
	var eBtnFalse;
	var eBtnClose;
	var isInit = false;
	var init = function(){
		isInit = true;
		if(typeof(oPop) == 'undefined'){
			oPop = new Pop();
		}
		var div = document.createElement("DIV");
		div.className = 'pop_s';
		div.id = id;
		var html = "<div class=\"p_t\"><h4>"+ sTit +"</h4><a href=\"javascript:;\" onclick=\"oPop.close()\" class=\"btn_close\"></a></div><div class=\"p_c clearfix\"><div class=\"p_txt\">"+sCon+"</div><div class=\"p_btns\"><a href=\"javascript:;\" onclick=\"oPop.close()\" class=\"btn_yel_01 mr_5\">确定</a><a href=\"javascript:;\" onclick=\"oPop.close()\" class=\"btn_gray_01\">取消</a></div></div>";
		div.innerHTML = html;
		document.body.appendChild(div);
		
	}
	this.show = function(tit,con,callback01,callback02){
		sTit = tit||'确认';
		sCon = con||'你确认么？';
		if(!isInit){
			init();
		}else{
			$('#'+id+' .p_t h4').html(sTit);
			$('#'+id+' .p_c .p_txt').html(sCon);
		}
		var eBtnSure = $('#'+id+' .p_c .p_btns a:eq(0)').unbind('click');
		var eBtnFalse = $('#'+id+' .p_c .p_btns a:eq(1)').unbind('click');
		var eBtnClose = $('#'+id+' .p_t a').unbind('click');
		
		if(callback01){
			eBtnSure.bind('click',callback01);
		}
		if(callback02){
			eBtnClose.bind('click',callback02);
			eBtnFalse.bind('click',callback02);
		}
		oPop.show(id);
		
		//为节约资源，不直接初始化。只有在调用时才初始化。
		
	}
}

if(typeof(window.popConfirm)=='undefined'){
	var tmpPopConfirm = new oFedConfirm();
	window['popConfirm'] = tmpPopConfirm.show;
}


//通用自定义confirm 弹出层
function oFedAlert(){
	var id = 'pop_fed_common_alert';
	var eTit;
	var sTit;
	var eCon;
	var sCon;
	var eBtnSure;
	var eBtnClose;
	var isInit = false;
	var init = function(){
		isInit = true;
		if(typeof(oPop) == 'undefined'){
			oPop = new Pop();
		}
		var div = document.createElement("DIV");
		div.className = 'pop_s';
		div.id = id;
		var html = "<div class=\"p_t\"><h4>"+ sTit +"</h4><a href=\"javascript:;\" onclick=\"oPop.close()\" class=\"btn_close\"></a></div><div class=\"p_c clearfix\"><div class=\"p_txt\">"+sCon+"</div><div class=\"p_btns\"><a href=\"javascript:;\" onclick=\"oPop.close()\" class=\"btn_yel_01 mr_5\">确定</a></div></div>";
		div.innerHTML = html;
		document.body.appendChild(div);
		
	}
	this.show = function(tit,con,callback){
		sTit = tit||'提示信息';
		sCon = con||'点击确认';
		if(!isInit){
			init();
		}else{
			$('#'+id+' .p_t h4').html(sTit);
			$('#'+id+' .p_c .p_txt').html(sCon);
		}
		var eBtnSure = $('#'+id+' .p_c .p_btns a:eq(0)').unbind('click');
		if(callback){
			eBtnSure.bind('click',callback);
		}
		oPop.show(id);
		
		//为节约资源，不直接初始化。只有在调用时才初始化。
		
	}
}

if(typeof(window.popAlert)=='undefined'){
	var tmpPopAlert = new oFedAlert();
	window['popAlert'] = tmpPopAlert.show;
}

function SetHome(url){
	var url = url||"http://www.51suqiu.com";
	if (document.all){ 
        document.body.style.behavior='url(#default#homepage)'; 
          document.body.setHomePage(url); 
    }else if (window.sidebar){ 
        if(window.netscape){ 
            try{ 
                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
            }catch (e){ 
                alert( "该操作被浏览器拒绝，如果想启用该功能，请在地址栏内输入 about:config,然后将项 signed.applets.codebase_principal_support 值该为true" ); 
            } 

        } 

        var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components. interfaces.nsIPrefBranch); 

        prefs.setCharPref('browser.startup.homepage',url); 

    }else{ 

        alert('您的浏览器不支持自动自动设置首页, 请使用浏览器菜单手动设置!'); 
	}
}


//生成一个从0-(_limit-1)的随机数;
var createRandom = function(_limit){
	var ranNum = Math.floor(Math.random()*_limit);
	return ranNum;
}

//输入框输入长度限制，此方法绑定在input,textarea的onkeyup事件上，参数分别人：this, maxlength,显示剩余字数的span的id.
function fed_inputLimit(target,maxlength,counterId){
	var last = maxlength-target.value.length;
	if(last>=0&&counterId){
		$('#'+counterId).html(last);
	}else{
		$(target).attr('value',target.value.toString().substring(0,maxlength));
		if(counterId){
			$('#'+counterId).html(0);
		}
	}
}

//输入框输入长度限制改进2，此方法绑定在input,textarea的onfocus事件上，参数分别人：this, maxlength,显示剩余字数的span的id.
function fed_inputMaxLength(target,maxlength,counterId, option){
	var oldLength = 0,reachMax, reachZero, reachNone, lessThan, lessThanCall;
	var isReach = 'none';
	if(!!option){
		
		if(option.reachMax){
			reachMax = option.reachMax;
		}
		if(option.reachZero){
			reachZero = option.reachZero;
		}
		if(option.reachNone){
			reachNone = option.reachNone;
		}
		
		if(option.lessThanCall&&option.lessThan){
			lessThanCall = option.lessThanCall;
			lessThan = option.lessThan;
		}
	}
	function reachManage(val){
		var length = val.length;
		if(length<=0){
			if(!!reachZero&&isReach!="zero"){
				reachZero();
			}
			isReach=="zero";
		}else if(length<maxlength){
			if(!!reachNone&&(isReach!="none")){
				reachNone();
			}
			isReach = "none";
		}else{
			if(!!reachMax&&isReach!="max"){
				reachMax(val);
			}
			isReach = "max";
		}
		if((maxlength-length)<lessThan&&(maxlength-oldLength)>=lessThan){
			lessThanCall();
		}
		
		oldLength = length;
	}
	
	function inputLimit(target,maxlength,counter){
		var last = maxlength-target.value.length;
		if(last>=0&&counter){
			counter.html(last);
		}else{
			$(target).attr('value',target.value.toString().substring(0,maxlength));
			if(counter){
				counter.html(0);
			}
		}
	}


	if($(target).attr('fed_max_length')==null){
		$(target).attr('fed_max_length',maxlength);
		var counter = $('#'+counterId);
		$(target).unbind("keyup").bind("keyup", function(event) {
			reachManage($(target).val());
			inputLimit(target, maxlength, counter);
		});
		$(target).bind('blur',function(){
			var last = maxlength-target.value.length;
			if($(target).val()==$(target).attr('placeholder')){
				last = maxlength;
			}else{
				reachManage($(target).val());
				inputLimit(target, maxlength, counter);
			}
		});
	}
	
}


//截取中英文混合字符串，参数为字符串和所限定的英文的长度
function fed_MixSubstr(str, len){
	var r = /[^\x00-\xff]/g;
	var rChar = "**";
	if (str.replace(r, rChar ).length <= len){
		return str ;  
	}
	var m = Math.floor(len/2);
	for ( var i=m; i< str.length; i++) {
		if ( str.substr(0, i).replace(r, rChar).length>=len) { 
			return str.substr(0, i); 
		}
	 }
	return str ;

}

//实现搜索输入框的输入提示js类
function oSearchSuggest(id,searchFuc,option){
	var input = $('#'+id);
	var suggestWrap;
	var key = "";
	var options;
	var init = function(){
		input.bind('keyup',sendKeyWord);
		input.bind('blur',function(){setTimeout(hideSuggest,500);})
		
		if(!option){
			option = {};
		}
		options = {};
		options.width = typeof option != "undefined" ? option.width:'default';
		options.max = option.max?option.max:'10';
		options.scroll = option.scroll?option.scroll:'no';
		options.scrollHeight = option.scrollHeight?option.scrollHeight:'10';
		suggestWrap = document.createElement('DIV');
		suggestWrap.className = "search_suggest";
		suggestWrap.innerHTML = "<ul></ul>";
		document.body.appendChild(suggestWrap);
		suggestWrap = $(suggestWrap);
		
		
	}
	var hideSuggest = function(){
		suggestWrap.hide();
	}
	
	
	//发送请求，根据关键字到后台查询
	var sendKeyWord = function(event){
		
		//键盘选择下拉项
		if(suggestWrap.css('display')=='block'&&event.keyCode == 38||event.keyCode == 40){
			var current = suggestWrap.find('li.hover');
			if(event.keyCode == 38){
				if(current.length>0){
					var prevLi = current.removeClass('hover').prev();
					if(prevLi.length>0){
						prevLi.addClass('hover');
						input.val(prevLi.html());
					}
				}else{
					var last = suggestWrap.find('li:last');
					last.addClass('hover');
					input.val(last.html());
				}
				
			}else if(event.keyCode == 40){
				if(current.length>0){
					var nextLi = current.removeClass('hover').next();
					if(nextLi.length>0){
						nextLi.addClass('hover');
						input.val(nextLi.html());
					}
				}else{
					var first = suggestWrap.find('li:first');
					first.addClass('hover');
					input.val(first.html());
				}
			}
			
		//输入字符
		}else{ 
			var valText = $.trim(input.val());
			if(valText ==''){
				key = '';
				hideSuggest();
				return;
			}else if(valText==key){
				return;
			}
			searchFuc(valText);
			key = valText;
		}			
		
	}
	//请求返回后，执行数据展示
	this.dataDisplay = function(data){
		if(data.length<0){
			hideSuggest();
			return;
		}
		//往搜索框下拉建议显示栏中添加条目并显示
		var li;
		var tmpFrag = document.createDocumentFragment();
		suggestWrap.find('ul').html('');
		for(var i=0; i<data.length; i++){
			li = document.createElement('LI');
			li.innerHTML = data[i];
			tmpFrag.appendChild(li);
		}
		suggestWrap.find('ul').append(tmpFrag);
		// set the suggestWrap layer's position
		var offset = input.offset();
		suggestWrap.css({
			width: typeof options.width == "string" || options.width > 0 ? options.width : input[0].offsetWidth-2,
			top: offset.top + input[0].offsetHeight,
			left: offset.left,
			display:'block'
		});
		
		//为下拉选项绑定鼠标事件
		suggestWrap.find('li').hover(function(){
				suggestWrap.find('li').removeClass('hover');
				$(this).addClass('hover');
		
			},function(){
				$(this).removeClass('hover');
		}).bind('click',function(){
			input.val(this.innerHTML);
			suggestWrap.hide();
		});
		
		
	}
	
	init();
	
};

function reload(){
	window.location.reload();
}

//弹出层统一清理函数，如模仿下拉框和一些弹出浮动层，在点击层外其它地方时要把层隐藏掉。而事件需要绑定在document上，所以统一绑定。
var popPurge = (function(){
	var list = [];
	function purge(e){
		var e = window.event?window.event.srcElement:e.target;
		if(list.length==0) return;
		var tempNode;
		for(var i=0; i<list.length; i++){
			if(!!list[i]){

				tempNode = e;
				while(tempNode!=list[i][0]&&tempNode!=list[i][1]&&tempNode!=document.body){
					tempNode = tempNode.parentNode;
				}
				if(tempNode==document.body){
					list[i][0].style.display = "none";
				}
			}
		}
	}
	//e is a HTML Node
	function add(e,t){
		if(!t){
			t = document.body;
		}
		list.push([e,t]);
	}
	this.add = add;
	$(document).bind('click', purge);
	return this;
})();





var JWBubble = (function(){
    if(typeof JWBubble!= 'undefined'){
        return; //避免重复初始化。
    }
    
    var $wrap;
    var $bd;
    var bubbles = [];
    var bubblesNext = [];
    var state = "hide"; //four states: hide, show, fadeIn, fadeOut. 
    var fadeStep = 0;
    var finalOpacity;
    var hideHandle = null;
    var keepTime = 2000;    //the time of bubble keep display.
    var ifInit = false;
    
    //init
    var init = function(){
        $bd = $(document.body);
        if($bd.length==0){
            setTimeout(init,200);
            return;
        }
        ifInit = true;
        $wrap = $('<div class="jw_bubble_wrap"></div>');
        $bd.append($wrap);
        showStackBubble();
    }
    
    var add = function(txt, type){
        type = type=="html"?"html":"txt";
        if(state=="fadeOut"||!ifInit){
            bubblesNext.push([txt,type]);
        }else{
            push(txt, type);
            if(state=="hide"){
                show();
            }
        }
        
    }
    
    var push = function(txt, type){
        
        var $bubble = $('<div class="jw_bubble"></div>');
        if(type=="html"){
            $bubble.html(txt);
        }else{
            $bubble.html('<p class="txt">'+ txt +'</p>');
        }
        $wrap.append($bubble);
        
        //延迟消失
        if(hideHandle != null){
            clearTimeout(hideHandle);
        }
        hideHandle = setTimeout(hide,keepTime);
        
    }
    var showStackBubble = function(){
        $wrap.empty();
        if(bubblesNext.length>0){
            for(var i=0, len=bubblesNext.length; i<len; i++){
                push(bubblesNext[i][0],bubblesNext[i][1]);
            }
            bubblesNext.splice(0, bubblesNext.length); //清空数组
            show();
        }
    }
    
    var show = function(){
        $wrap.show().css("opacity",0);
        fadeStep = 0;
        state = "fadeIn";
        fading();
    }
    var hide = function(){
        fadeStep = 0;
        state = "fadeOut";
        fading();
    }
    var fading = function(){
        var opacity;
        fadeStep++;
        if(fadeStep==21){
            //the final step
            if(state=="fadeOut"){
                //finished the fadeOut
                state = "hide";
                $wrap.hide();
                showStackBubble();
            }else{
                state = "show";
            }
        }else{
            if(state=="fadeOut"){
                opacity = 1 - fadeStep*0.05;
            }else{
                opacity = fadeStep*0.05;
            }
            $wrap.css({opacity:opacity});
            
            setTimeout(fading,20);
        }
    }
    
    
    var setKeepTime = function(time){
        keepTime = time;
    }
    
    
    init();

    return {
        add:add,
        setKeepTime: setKeepTime
    };
})();

function bubbleTxt(txt){
    JWBubble.add(txt);
}
function bubbleAlert(txt){
    var html = '<span class="ico_bubble_alert">!</span><p class="txt_r">'+ txt +'</p>';
    JWBubble.add(html, "html");
}
function bubbleWrong(txt){
    var html = '<span class="ico_bubble_wrong">x</span><p class="txt_r">'+ txt +'</p>';
    JWBubble.add(html, "html");
}
function bubbleRight(txt){
    var html = '<span class="ico_bubble_right">√</span><p class="txt_r">'+ txt +'</p>';
    JWBubble.add(html, "html");
}
