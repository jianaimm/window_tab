//获取全局元素；
var elements = {
	contextmenu: document.querySelector('.context'),
	files: document.querySelector('#files'),
	crumbs: document.querySelector('#crumbs'),
	upload: document.querySelector('#upload'),
	back: document.querySelector('#back'),
	paths: document.querySelector('#paths'),
	mask: document.querySelector('.mask'),
	close: document.querySelector('.close'),
	fileDetail: document.querySelector('#fileDetail'),
	detailClose: document.querySelector('#detailClose')
};
var start = '新建文件夹';
var start2 = '新建文本文档';
var start3 = '新建图片';
var restorePid;//记录删除元素的pid;
var nub = 0; //记录当前桌面第几张背景图；
var selectedLi = null;//记录当前选中的li;
var upLoadFile = null;//用来记录上传的文件；
var trash = null;//获取垃圾桶；
var extNub = null;//记录名称后缀的值；
var fromName = null;//记录'('之前的名称；
var reg = /^新建文件夹\(\d+\)$/; //正则判断重命名；
var prevParent = null;//记录双击进去的文件夹；用来粘贴；
var stickEle = [];//存放复制的数据；
var activesStick = null;//存放选中需要复制，粘贴的元素；
//用来记录当前渲染的目录的编号；
var _ID = 0;
//渲染初始化数据，显示pid为0的数据；
view(_ID);
//记录粘贴选项的li的数据；
var stickLi = null;

data.main.menu.forEach(function(item){
	if(item.name == '粘贴'){
		stickLi = item;
	}

});
//判断垃圾桶中是否有垃圾；
getTrash();
function getTrash(){
	var trashChild = getChildren(trash.item.id);
	if(trashChild.length){
		trash.item.type = 'trashIN';

	} else {
		trash.item.type = 'trash';
	}
}

//显示右键菜单；
document.addEventListener('contextmenu',function(e){
	cancelFile();//取消所有文件夹的选中；
	hideContextmenu();//隐藏右键菜单；
	var filesActive = document.querySelectorAll('.file.active');
	for(var i = 0;i < filesActive.length;i++){
		filesActive[i].classList.remove('active');
	}
	if(e.target.classList.contains('file') || e.target.parentNode.classList.contains('file')) {
		if(e.target.classList.contains('trash') || e.target.parentNode.classList.contains('trash')){//显示回收站右键菜单；
			showContextmenu(e,data.main.trash);
		} else if(e.target.dataset.ip || e.target.parentNode.dataset.ip){
			//显示回收站里的文件夹右键菜单；
			showContextmenu(e,data.main.trashFile);
		} else {//显示文件夹右键菜单；
			showContextmenu(e,data.main.file);
		}
		
		if(e.target.classList.contains('file')){
			 e.target.classList.add('active');
			 selectedLi = e.target;
		} else if(e.target.parentNode.classList.contains('file')){
			e.target.parentNode.classList.add('active');
			selectedLi = e.target.parentNode;
		}
	} else {//显示桌面右键菜单；
		showContextmenu(e,data.main.menu);
	}
});

document.addEventListener('mousedown',function(e){
	hideContextmenu();//隐藏右键菜单；
	cancelFile();//取消所有文件夹的选中；
});
//返回上一级；
elements.back.addEventListener('click',function(e){
	var info = getInfo(_ID);
	if(info){
		view(info.pid);
	}
});
//音视频播放时禁用右键菜单；
elements.fileDetail.oncontextmenu = function(e){
	e.stopPropagation();
	e.preventDefault();
}
elements.fileDetail.onmousedown = function(e){
	e.stopPropagation();
}
elements.fileDetail.onclick = function(e){
	e.stopPropagation();
}
//音视频播放时的关闭事件；
elements.detailClose.onclick = function(e){
	elements.fileDetail.style.display = 'none';
	elements.fileDetail.children[0].innerHTML = '';
	e.stopPropagation();
}
//遮罩层mask出现时禁用右键菜单；
elements.mask.oncontextmenu = function(e){
	e.stopPropagation();
	e.preventDefault();
}
elements.mask.onmousedown = function(e){
	e.stopPropagation();
}
elements.mask.onclick = function(e){
	e.stopPropagation();
}
/*框选*/
toSelector();
function toSelector(){
	document.addEventListener('mousedown',function(e){
		if(e.button == 2){
			return;
		}
		var files = 	document.querySelectorAll('.file:not(.trash)');
		var selector = document.createElement('div');
		selector.className = 'selector';
		var start = {x: e.clientX,y: e.clientY};
		css(selector,'left',start.x);
		css(selector,'top',start.y);
		document.addEventListener('mousemove',move);
		document.addEventListener('mouseup',end);
		function move(e){
			document.body.appendChild(selector);
			window.isMove = true;
			var now = {x: e.clientX,y: e.clientY};
			var dis = {x: now.x - start.x,y: now.y - start.y};
			css(selector,'left',Math.min(now.x,start.x));
			css(selector,'top',Math.min(now.y,start.y));
			css(selector,'width',Math.abs(dis.x));
			css(selector,'height',Math.abs(dis.y));
			for(var i = 0;i < files.length;i++){
				if(getCollide(files[i],selector)){
					files[i].classList.add('active');
				} else{
					files[i].classList.remove('active');
				}
			}	
		}
		function end(e){
			document.removeEventListener('mousemove',move);
			document.removeEventListener('mouseup',end);
			document.querySelector('.selector') && document.body.removeChild(selector);
			window.isMove = false;//框选结束，关闭框选开关；
		}
	});	
};
//键盘事件；新建文件夹；
document.addEventListener('keydown',function(e){
//	console.log(e.keyCode)
	if(e.keyCode == 78 && e.shiftKey){
		contextmenuCallback.createFile();
		e.preventDefault();
	}
});
////表盘时钟
//(function(){
//	var scale = document.querySelector('.scale');
//var hour = document.querySelector('.hour');
//var minute = document.querySelector('.minute');
//var second = document.querySelector('.second');
//var timer = 0;
//var inner = '';
//var deg = 6;//每个刻度旋转角度为6度；
//var length = 60;//总共有60个刻度；
//
//for(var i = 0;i< length;i++) {
//	inner += '<span style="transform: rotate('+ (i*6)+'deg);"></span>';
//}
//scale.innerHTML = inner;
//toTime();
//clearInterval(timer);
//timer = setInterval(toTime,500);
//function toTime() {
//	var time = new Date();
//	var seconds = time.getSeconds();//一圈60秒钟，一秒钟的旋转度数为360/60 = 6度；
//	var minutes = time.getMinutes()+seconds/60;
//	//一圈60分钟，一分钟的旋转度数为360/60 = 6度；如果不加seconds/60，那么分针就会在正分钟时跳一下，而不是随着秒针的走动而向前偏移，比如半分钟；
//	var hours = time.getHours()+minutes/60;
//	//一圈12小时，一小时的旋转度数为360/12=30度；如果不加minutes/60，那么时针就会在正点时走一下，而不是随着分针的走动而向前偏移，比如半小时；
//	
//	hour.style.transform = 'rotate('+ hours*30+'deg)';
//	minute.style.transform = 'rotate('+ minutes*6+'deg)';
//	second.style.transform = 'rotate('+ seconds*6+'deg)';
//}
//})();
//垃圾桶双击时
var arrChildren = [];//存放要还原的文件夹的子文件夹；
var arrParent = [];//存放要还原的文件夹；垃圾桶里添加进去的父级；


