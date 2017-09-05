
//显示右键菜单；
function showContextmenu(e,data){
	e.preventDefault();
	elements.contextmenu.innerHTML = '';//清空菜单内容；
	elements.contextmenu.style.left = e.clientX + 'px';
	elements.contextmenu.style.top = e.clientY + 'px';
	elements.contextmenu.style.display = 'block';
	resetContext(elements.contextmenu);//重置右键菜单位置；
	createChild(elements.contextmenu,data);//生成子菜单；
	setMouseover(elements.contextmenu);//li的移入移出效果；
	setContext(elements.contextmenu);//主菜单的过界处理；
}
//隐藏右键菜单；
function hideContextmenu(e){
	elements.contextmenu.style.display = 'none';
}
//生成右键菜单的子级li；
function createChild(contextmenu,data){
	data.forEach(function(item){
		var li = document.createElement('li');
		//判断禁用项和下划线；
		if(item.type && item.type == 'splitLine'){
			li.classList.add('splitLine');
		} else {
			li.innerHTML = `<p>${item.name}</p>`;
		}
		if(item.disabled){
			li.classList.add('disabled');
		}
		//给每一项添加按下事件；
		if(item.callBack){
			li.onmousedown = function(e){
				hideContextmenu(e);//隐藏右键菜单；
				contextmenuCallback[item.callBack](data);
			};
		}
		if(item.children){
			var ul = document.createElement('ul');
			resetUl(ul);//重置子菜单的位置；
			createChild(ul,item.children);//生成子菜单的子菜单；
			li.appendChild(ul);
		}
		contextmenu.appendChild(li);	
		//重置子菜单的位置；
		function resetUl(ul){
			var rect1 = ul.getBoundingClientRect();
			var x = document.documentElement.clientWidth;
			var y = document.documentElement.clientHeight;
			if(rect1.right > x){
				ul.style.left = -(ul.offsetWidth - 10) + 'px';
			} else if(rect1.bottom > y){
				ul.style.top = ul.offsetParent.clientHeight - rect1.height + 'px';
			}
		}
	});
}
//重置右键菜单的位置；
function resetContext(el){
	var x = css(el,'left');
	var y = css(el,'top');
	var maxX = document.documentElement.clientWidth - el.offsetWidth;
	var maxY = document.documentElement.clientHeight - el.offsetHeight;
	css(el,'left',Math.min(maxX,x));
	css(el,'top',y > maxY ? y - el.offsetHeight : y);
}
//窗口改变时，自动调整文件/文件夹位置；
window.addEventListener('resize',function(){
	resetContext(elements.contextmenu);//重置右键菜单位置；
	resetOffset();//重置文件夹位置；
});
//重置文件夹位置；
function resetOffset(){
	var files = document.querySelectorAll('.file');
	for(var i = 0;i < files.length;i++){
		var offset = setOffset(i);
		startMove({
			el: files[i],
			target: {
				left: offset.x,
				top: offset.y
			},
			time: 500,
			type: 'easeOut'
		});
	}
};
//右键菜单li的移入移出效果；
function setMouseover(ul){
	var lis = ul.children;
	for(var i = 0;i < lis.length;i++){
		lis[i].addEventListener('mouseover',function(e){
			if(this.classList.contains('disabled') || this.classList.contains('splitLine')){
				return;
			}
			for(var i = 0;i < lis.length;i++){
				if((!lis[i].classList.contains('disabled')) && (!lis[i].classList.contains('splitLine'))){//大清洗时，排除disabled和splitLine的元素，不进行清洗class；
					lis[i].className = '';
				}
				
				var uls = lis[i].children[1];
				if(uls){
					uls.style.display = 'none';
				}
			}
			this.className = 'active';
			var ul = this.children[1];
			if(ul){
				ul.style.cssText = 'display: block';
				setSubContext(ul);//设置子菜单的过界处理；
				setMouseover(ul);//设置子菜单的移入移出；
			}
		});
		lis[i].addEventListener('mouseout',function(e){
			if(this.classList.contains('disabled')|| this.classList.contains('splitLine')){
				return;
			}
			var ul = this.children[1];
			if(!ul){
				this.className = '';
				e.stopPropagation();
			}
		});
	}
}
//主右键菜单过界处理；
function setContext(el){
	//如果根据内容的宽度生成右键菜单的宽度，要放到appendChild()后面，添加到页面后，再获取宽高和left，top值；
	var maxX = document.documentElement.clientWidth - el.offsetWidth;
	var maxY = document.documentElement.clientHeight - el.offsetHeight;
	var x = css(el,'left');
	var y = css(el,'top');
	css(el,'left',Math.min(maxX,x));
	css(el,'top',y > maxY ? y - el.offsetHeight : y);
}
//子菜单过界处理：
function setSubContext(el){
	var rect1 = el.getBoundingClientRect();
	var maxX = document.documentElement.clientWidth;
	var maxY = document.documentElement.clientHeight;
	if(rect1.right > maxX){
		el.style.left = -(el.offsetParent.clientWidth + 10) + 'px';
	} 
	if(rect1.bottom > maxY){
		el.style.top = el.offsetParent.clientHeight - rect1.height + 'px';
	}
}

//渲染页面；
/*只要调用了view方法，那么我们就把_ID设置成我们要view的pid
  记录_ID的值，以便其他的地方去使用，记录当view过后，当前所在的目录的id*/
function view(pid){
	_ID = pid;//同步要渲染的页面；
	if(_ID == 0){
		elements.paths.style.transform = 'translateY(-60px)';
	}
	//文件列表；
	var dataList = getChildren(_ID);//桌面；
	
	elements.files.innerHTML = '';
	//根据数据，生成文件夹；
	dataList.forEach(function(item,index){
		var file = document.createElement('li');
		file.className = 'file';
		var div = document.createElement('div');
		div.className = 'img';
		div.style.backgroundImage = `url(img/${item.type}.png)`;
		file.type = item.type;
		file.Pid = item.pid;
		file.item = item;//设置一个自定义属性，把data.list里的每一个对象赋值于li的自定义属性item;数据双向绑定，更改双方中的任一方，都会更改对方的值；因此更改li的item属性，会相应更改对应的data.list里的对象的内容；
		var input = document.createElement('input');
		input.type = 'text';
		var p = document.createElement('p');
		p.innerHTML = `${item.name}`;
		if(item.extname && item.type != 'trash'&&item.type != 'trashIN' && item.name == start){//最后一个&&用途是，防止中途添加进去的名字被加上后缀；
			p.innerHTML += `(${item.extname})`;
		}
		if(file.item.isRestore){//如果文件被删除了，就为true，同时，给该文件添加自定义属性ip；
			file.dataset.ip = 1;
		}
		file.appendChild(div);
		file.appendChild(p);
		file.appendChild(input);
		var offset = setOffset();//设置生成的文件或文件夹的位置；
		file.style.left = offset.x + 'px';
		file.style.top = offset.y + 'px';
		file.addEventListener('dblclick',function(){

			selectedLi = this;
			prevParent = this.item;
//			console.log(prevParent)
			hideContextmenu();//隐藏右键菜单；
			open();//打开文件夹或播放音视频；
		});
		if(file.type == 'trash'|| file.type == 'trashIN'){
			file.classList.add('trash');
			trash = file;
		}
		setFileActive(file);//设置li的移入移出点击事件；
		drag(file);//设置拖拽；
		elements.files.appendChild(file);
	});
	/* 导航列表
	 由三个部分组成：顶层 + 所有父级 + 当前目录*/
	elements.crumbs.innerHTML = '';
	//顶级；
	var li = document.createElement('li');
	li.innerHTML = `<a href="javascript:;"style="color: #2299f7">桌面</a>`;
	li.onclick = function(){
		view(0);
	};
	elements.crumbs.appendChild(li);
	//所有父级；
	var pathList = getParents(_ID);
	pathList.forEach(function(item){
		var li = document.createElement('li');
		var name = item.name;
		if(item.extname){
			name += `(${item.extname})`;
		}
		li.innerHTML = `<span>&gt;</span><a href="javascript:;"style="color: #2299f7">${name}</a>`;
		li.addEventListener('click',function(e){
			view(item.id);
		});
		elements.crumbs.appendChild(li);
	});
	//当前所在目录；
	var info = getInfo(_ID);
	if(info){
		var infoName = info.name;
		if(info.extname){
			infoName += `(${info.extname})`;
		}
		var li = document.createElement('li');
		li.innerHTML = `<span>&gt;</span><span style="color: #9e9e9e">${infoName}</span>`;
		elements.crumbs.appendChild(li);
	}
}
//双击打开事件，或者右键打开事件；
function open(){
	if(selectedLi.item.type == 'file'||selectedLi.item.type == 'trash'||selectedLi.item.type == 'trashIN'){
		//文件夹双击打开子文件夹；
		if(selectedLi.item.type == 'trash'||selectedLi.item.type == 'trashIN'){
			stickLi.disabled = true;//如果双击打开了垃圾桶，就禁用右键粘贴选项；
		}
		view(selectedLi.item.id);
		elements.paths.style.transform = 'translateY(0px)';
	} else {
		toOpenVideo(selectedLi.item.type);//双击播放音视频等；
	}	
}
//文件夹的移入移出和点击效果；
function setFileActive(li){
	var files = document.getElementsByClassName('file');
	li.addEventListener('mouseover',function(){
		if(window.isMove){
			return;
		}
		this.classList.add('hover');
	});
	li.addEventListener('click',function(e){
		for(var i = 0;i < files.length;i++){
			files[i].classList.remove('active');
		}
		this.classList.add('active');
		selectedLi = this;//同步选中的li;
		e.stopPropagation();
	});
	li.addEventListener('mouseout',function(){
		this.classList.remove('hover');
	});
}
//设置生成的文件或文件夹的位置；
function setOffset(index){
	var files = document.querySelectorAll('.file');
	index = (typeof index != 'undefined')? index : files.length;
	var fileW = 150;//fileW = css(files[0],'width')+5;
	var fileH = 146;//fileH = css(files[0],'height')+10;
	var ceils = Math.floor(document.documentElement.clientHeight/fileH);//一列放几个；
	var cols = Math.floor(index/ceils);//第几列；
	var rows = index % ceils ;//第几行；
	return {x: cols*fileW,y: rows*fileH};
}
//取消页面所有选中的文件夹；
function cancelFile(){
	var files = document.querySelectorAll('.file');
	for(var i = 0;i < files.length;i++){
		files[i].classList.remove('active');
	}
}

//存放右键菜单的每个函数；
var contextmenuCallback = {
	upload: function(){//上传文件；
		elements.upload.click();//点击上传时，等于点击了input,type=file,上传文件；
		OnUpload();
	},
	createFile: function(){//新建文件夹；
		addData({
			pid: _ID,
			type: 'file',
			name: start,
			time: Date.now()
		});
		view(_ID);//渲染；
	},
	createText: function(){//新建文本文档；
		addData({
			pid: _ID,
			type: 'text',
			name: start2,
			time: Date.now()
		});
		view(_ID);//渲染；
	},
	del: function(){//删除文件夹；
		var delLi = selectedLi;
		delLi.item.isRestore = true;
		restorePid = delLi.item.pid;//同步记录下删除的元素的之前的pid;
		delLi.item.pid = trash.item.id;//删除选中，操作数据；
		getTrash();//判断垃圾桶中是否有垃圾，更换背景图；
		view(_ID);//渲染；
	},
	rename: function(){//重命名；
		var p = selectedLi.children[1];
		var inputT = selectedLi.children[2];
		inputT.onmousedown = function(e){
			e.cancelBubble = true;//阻止冒泡；
		}
		p.style.display = 'none';
		inputT.style.display = 'block';
		inputT.value = p.innerHTML;
		setTimeout(function(){//添加一个定时器，延迟选中；因为我们用的是onmousedown事件，当鼠标摁下时执行了选中，当鼠标抬起时，就取消选中了，就没有触发mousedown事件，如果用click就没这个问题；
			inputT.select();
		},16);
		var reg = /(\(\d+\))$/;
		inputT.oninput = function(){
			if(inputT.value.indexOf('(') != -1 && inputT.value.indexOf(')') != -1){
				extNub = inputT.value.split('(')[1].split(')')[0];
				fromName = inputT.value.split('(')[0];

			}
			fromName = inputT.value;
			extNub = 0;
//			if(reg.test(inputT.value)){
//				var ext = inputT.value.match(reg);
//				console.log(ext.input);
//				extNub = inputT.value.split('(')[1].split(')')[0];
//				fromName = inputT.value.split('(')[0];
//			}
		}
		Onblur();//失去焦点时；
	},
	open: function(){//双击或者右键打开文件/文件夹；
		open();
	},
	nameSort: function(){//按名称排序；
		data.list.sort(function(a,b){
			if(pinyin.getFullChars(a.name) > pinyin.getFullChars(b.name)){
				return 1;
			}
			return -1;
		});
		view(_ID);
	},
	timeSort: function(){//按时间排序；
		data.list.sort(function(a,b){
			return a.time - b.time;
		});
		view(_ID);
	},
	typeSort: function(){//按类型排序；
		data.list.sort(function(a,b){
			if(a.type < b.type){
				return 1;
			}
			return -1;
		});
		view(_ID);
	},
	changeTableSkin: function(){//更换桌面背景；
		var backImage = document.querySelector('.backImage');
		var skin = backImage.children[0];
		nub++;
		skin.style.backgroundImage = 'url('+ arrImg[nub%arrImg.length] +')';
		skin.style.backgroundSize = 'cover';
	},
	empty: function(){//清空；
		var children = getChildren(trash.item.id);
		children.forEach(function(child){
			data.list = data.list.filter(function(item){
				return item.id != child.id;
			});
		});
		getTrash();//判断垃圾桶中是否有垃圾，更换背景图；
		view(_ID);
	},
	restoreAll: function(){//全部还原；
		var children = getChildren(trash.item.id);
		children.forEach(function(child){
			child.pid = restorePid;
			child.isRestore = false;
		});
		getTrash();//判断垃圾桶中是否有垃圾，更换背景图；
		view(_ID);	
	},
	restoreOne: function(){//单个还原；
		selectedLi.item.pid = restorePid;
		selectedLi.item.isRestore = false;//还原后，关闭开关，文件夹的右键菜单恢复正常；
		getTrash();//判断垃圾桶中是否有垃圾，更换背景图；
		view(_ID);
	},
	copy: function(){//复制；
		stickLi.disabled = false;//把右键粘贴的禁用取消；
		stickEle = [];//每次复制前，清空上一次内容；
		copy();
		view(_ID);
	},
	stick: function(){//粘贴；
		
		stick();
	},
	delForever: function(){//彻底删除；
		data.list = data.list.filter(function(child){
			return child.id != selectedLi.item.id;
		});
		getTrash();
		view(_ID);
	},
    refresh: function(){//刷新；
		console.log('刷新');
		view(_ID);
	}
};
//上传文件；
function OnUpload(){
	elements.upload.addEventListener('change', function(e){
		upLoadFile = e.target.files[0];
//		console.log(upLoadFile)
		var fileType = upLoadFile.type.split('/')[0];
		if(!((fileType == 'text'&&upLoadFile.type.split('/')[1] == 'plain') || fileType == 'image' || fileType == 'video' || fileType == 'audio')){
			alert('目前只支持文本，图片，音频，视频的上传哦~');
			return;
		}
		var name = upLoadFile.name;
		addData({
			pid: _ID,
			type: fileType,
			name: upLoadFile.name,
			time: Date.now()
		});
		view(_ID);
		elements.upload.value = '';
	},{once: true});//once:true,代表该事件监听一次只执行一个；
}
//双击执行函数之一，播放音视频或者展示图片，文本；
function toOpenVideo(fileType){
	var fileDetailContent = elements.fileDetail.children[0];
	//每次打开时先清空之前的内容;
	fileDetailContent.innerHTML = '';
	//读取文件；
	var reader = new FileReader();
	reader.onload = function(e){
		elements.fileDetail.style.display = 'block';
		var result = e.target.result;//读取结果；
		if(fileType == 'text'){
			var p = document.createElement('p');
			p.innerHTML = result;
			fileDetailContent.appendChild(p);
		} else if(fileType == 'image'){
			var img = new Image();
			img.src = result;
			fileDetailContent.appendChild(img);
		} else if(fileType == 'video'){
			var video = document.createElement('video');
			video.src = result;
			video.setAttribute('loop','');
			video.setAttribute('controls','');
			fileDetailContent.appendChild(video);
		} else if(fileType == 'audio'){
			var audios = document.createElement('audio');
			audios.src = result;
			audios.setAttribute('loop','');
			audios.setAttribute('controls','');
			fileDetailContent.appendChild(audios);
		}
	};
	//不同类型的读取方式；
	if(fileType == 'text'){
		reader.readAsText(upLoadFile);
	} else {
		reader.readAsDataURL(upLoadFile);
	}
}

//判断是否重名，当inputT失去焦点时，如果重名弹出mask遮罩层提示；
function Onblur(){
	var p = selectedLi.children[1];
	var inputT = selectedLi.children[2];
	var type = selectedLi.type;
	var pid = selectedLi.Pid;
	var reg = /\(\d+\)$/;
	var warning = document.querySelector('.warning');
	css(warning,'scale',0);//要css控制transform 的 scale前，先要设置一下
	inputT.onblur = function(){
		//判断是否重名；
		if(hasName(fromName,type,pid,extNub)){
			elements.mask.style.display = 'block';
			startMove({
				el: warning,
				target: {
					opacity: 100,
					scale: 100
				},
				type: 'backOut',
				time: 500
			});
			elements.close.onclick = function(e){
				e.preventDefault();
				e.stopPropagation();
//				elements.mask.style.display = 'none';
				startMove({
					el: warning,
					target: {
						opacity: 0,
						scale: 0
					},
					time: 400,
					type: 'easeIn',
					callBack: function(){
						elements.mask.style.display = 'none';
					}
				})
				inputT.focus();
				inputT.select();
			}
			return;
		} 
		if(inputT.value.trim() != ''){
			p.innerHTML = inputT.value;
		}
		//更改数据;
		if(extNub){
			selectedLi.item.name = fromName + '(' + extNub + ')';
		} else {
			selectedLi.item.name = fromName;
		}
		selectedLi.item.extname = extNub;
		inputT.style.display = 'none';
		p.style.display = 'block';	
	}
}
//inputT onblur中判断是否有重名的，如果有就弹出mask提示层；
function hasName(fromName,type,pid,extNub){
	//如果inputT的value跟数组里的某一位name相同，并且数组里的这位name不等于当前选中的li下面的p的内容，同时，pid相同，type相同，就判断已经有这个名字了；

	for(var i = 0;i < data.list.length;i++){
        if(selectedLi.item != data.list[i] && fromName == data.list[i].name &&
            type == data.list[i].type && pid == data.list[i].pid && extNub == data.list[i].extname
		){

			return true;
		}
	}
	return false;
}
/*拖拽删除*/
function drag(file){
	var files = document.querySelectorAll('.file');
//	var trash = document.querySelector('.trash');已经设了一个全局trash,故不需要再次获取，直接使用即可；
	file.addEventListener('mousedown',function(e){
		if(e.button == 2){
			return;
		}
		file.classList.add('active');
		var Files = document.querySelectorAll('.file:not(.active)');
		e.stopPropagation();
		e.preventDefault();
		selectedLi = this;
		var start = {x: e.clientX,y: e.clientY};
		var nowNode = null;
		var trashNode = null;
		var Actives = null;
		var startOffsets = [];
		var arrClones = [];
		var isDel = false;
		document.addEventListener('mousemove',move);
		document.addEventListener('mouseup',end);
		function move(e){
			if(!nowNode){
				Actives = elements.files.querySelectorAll('.active,.hover');
				for(var i = 0;i< Actives.length;i++){
					var nodes = Actives[i].cloneNode(true);
					nodes.style.opacity = .5;
					nodes.classList.remove('active');
					arrClones.push(nodes);
					elements.files.appendChild(nodes);
					startOffsets[i] = {x: css(Actives[i],'left'),y: css(Actives[i],'top')};
					if(selectedLi == Actives[i]){
						nowNode = nodes;//找到当前选中的li的克隆元素；
					}
					if(Actives[i].type == 'trash' || Actives[i].type == 'trashIN'){
						trashNode = nodes;//找到垃圾桶的克隆元素；
					}
//					console.log(nowNode,trashNode)
				}
			}
			var dis = {x: e.clientX - start.x,y: e.clientY - start.y};
			for(var i = 0;i < arrClones.length;i++){
				css(arrClones[i],'left',dis.x + startOffsets[i].x);
				css(arrClones[i],'top',dis.y + startOffsets[i].y);
			}
			//给碰撞到的文件，添加hover状态；
			for(var i = 0;i < Files.length;i++){
				if(getCollide(Files[i],nowNode)){
					Files[i].classList.add('hover');
				} else {
					Files[i].classList.remove('hover');
				}
			}
		}
		function end(e){
			document.removeEventListener('mousemove',move);
			document.removeEventListener('mouseup',end);
			if(!nowNode){
				return;
			}
			//垃圾桶和当前的克隆元素碰撞时，并且当前克隆元素不是垃圾桶的克隆元素，并且拖拽删除的元素里没有垃圾桶，则删除选中的所有元素；
			if( getCollide(nowNode,trash) && nowNode != trashNode){	
				for(var j = 0;j < Actives.length;j++){
					restorePid = Actives[j].item.pid;
					Actives[j].item.pid = trash.item.id;
					Actives[j].item.isRestore = true;
				}	
			}
			//当nowNode和其他的文件夹碰撞，就把选中的文件放到该文件夹里；
			for(var i = 0;i < Files.length;i++){
				if( (Files[i].item.type == 'file'|| Files[i].item.type == 'trash' || Files[i].item.type == 'trashIN')&& getCollide(nowNode,Files[i]) && nowNode != trashNode){
					for(var j = 0;j < Actives.length;j++){
						Files[i].classList.add('active');
						Actives[j].item.pid = Files[i].item.id;
					}
				}
			}
			getTrash();//判断垃圾桶中是否有垃圾，更换背景图；
			view(_ID);
		}
	});	
}
//碰撞检测；
function getCollide(el,el2){
	var rect1 = el.getBoundingClientRect();
	var rect2 = el2.getBoundingClientRect();
	if(rect1.right < rect2.left || rect1.left > rect2.right || rect1.top > rect2.bottom || rect1.bottom < rect2.top){
		return false;
	}
	return true;	
}
//下拉更换桌面背景；
changeTableSkin();
function changeTableSkin(){
	var backImage = document.querySelector('.backImage');
	var skin = backImage.children[0];
	var buckle = document.querySelector('.buckle');
	var rope = document.querySelector('.rope');
	buckle.addEventListener('mousedown',function(e){
		nub++;
		e.stopPropagation();
		e.preventDefault();
		var start = {x: e.clientX,y: e.clientY};
		var buckleTop = css(buckle,'top');
		var ropeTop = css(rope,'top');
		var dis,now;
		document.addEventListener('mousemove',move);
		document.addEventListener('mouseup',end);
		function move(e){
			now = {x: e.clientX,y: e.clientY};
			dis = {x: now.x - start.x,y: now.y - start.y};
			css(buckle,'top',dis.y+buckleTop);
			css(rope,'top',dis.y+ropeTop);
		}
		function end(e){
			document.removeEventListener('mousemove',move);
			document.removeEventListener('mouseup',end);
			if(!now){
				return;
			}
			if(dis.y > 50){
				nub++;
				skin.style.background = 'url('+ arrImg[nub%arrImg.length] +') no-repeat center center';
				skin.style.backgroundSize = 'cover';
			}
			css(buckle,'top',buckleTop);
			css(rope,'top',ropeTop);
		}
	});
}
//复制；
var nameA;//存储复制时的名字，以便粘贴时使用；
function copy(){
	activesStick = document.querySelectorAll('.file.active');
//	var nameA;
	if(activesStick.length){
		for(var i = 0;i < activesStick.length;i++){
			if(activesStick[i].item.extname){
				nameA = activesStick[i].item.name + '(' + activesStick[i].item.extname + ')';
			} else {
                nameA = activesStick[i].item.name;
			}

			stickEle.push({//复制一份数据；
				id: activesStick[i].item.id,
				pid: activesStick[i].item.pid,
				name: nameA,
				type: activesStick[i].item.type,
				time: Date.now()
			});
		}
//		console.log(stickEle)
	}	
//	console.log(data.list)
}		
//粘贴；
function stick(){
	var stick = stickEle[0];
	// console.log(stick)
	var stickName = stick.name;
	stick.pid = (prevParent = 'undefined')? _ID: prevParent.id;//prevParent需要粘贴到的元素的id；
	if(prevParent.type == 'trash' || prevParent.type == 'trashIN'){
		return;//垃圾桶内不可以粘贴；
	}
	checkStick(stick);//粘贴时判断是否重名；

	var childrenAll = getChildrenChild(stick.id);//获取所有子级；
	childrenAll.unshift(stick);//获取自己数据,与子级合并；
	var arrStick = [];
	childrenAll.forEach(function(childs){
		arrStick.push(deepCopy(childs));
	});
	getStickArr(arrStick);
}
//更改拷贝的元素的id 和 pid;
function getStickArr(arrStick){
	var num = getMaxId();
	arrStick.forEach(function(item){
		item.lastId = item.id;
		item.id = ++num;
	});
	var copyStick = [];
	arrStick.forEach(function(item){
		copyStick.push(deepCopy(item));
	});
	for(var i = 0;i < arrStick.length;i++){
		for(var j = 0;j < copyStick.length;j++){
			if(arrStick[i].pid == copyStick[j].lastId){
				arrStick[i].pid = copyStick[j].id;
			}
		}
	}
	arrStick.forEach(function(item){
		data.list.push(item);	
	});
	view(_ID);
}
//深度拷贝，切断对象引用关系；
function deepCopy(origin,copy){
	var copy = copy || {};
	for(var i in origin){
		if(typeof origin[i] === 'object'){
			copy[i] = (origin[i].constructor === 'Array') ? [] : {};
			deepCopy(origin[i],copy[i]);
		} else {
			copy[i] = origin[i];
		}
	}
	return copy;
}
/*通过记录pid的方式来实现粘贴； 
 *如果没有双击，就代表是在桌面，pid = 0;
 * 如果有双击，就记录下双击时的id,也就是去粘贴时的pid；
 * 双击后，通过路径导航返回上一级，再记录下此时的id,也即即将粘贴的文件的pid;
 * 可以通过View(_ID)中的ID，来实现；
 * */
 //粘贴时判断是否重名，添加后缀；
 var stickNub = 2;
function checkStick(stick){
	var childrenOne = getChildren(_ID);
	var postfix = '-副本';
	var reg = /\-副本(\(\d+\)){1}$/;
	var reg2 = /\-副本/;
	if(childrenOne.length){//有子级时；
		childrenOne.forEach(function(child){
			var name = child.extname ? child.name + '('+ child.extname+')':child.name;
				// console.log(name)
			if(name != stick.name){//如果没有该文件夹，
				// console.log(1)
				stick.name = nameA;
			} else {//如果有重名的；

				getStickName();
			}
		});	
	} else {//没有子级时，直接粘贴；
		// console.log(2)
		stick.name = nameA;
	}
	
	//用正则判断：	/\-副本(\(\d+\))?$/
	//意思是：包含"-副本"，并且后面是以"(一组数字)"结尾，? 表示最少0次，最多一次；
	function getStickName(){
		if(!reg2.test(stick.name)){//没有副本时；
			console.log(3)
			stick.name = stick.name + postfix;
		} else {//有副本时；
			if(!reg.test(stick.name)){//没有数字时；
				console.log(4)
				stick.name = stick.name +`(${stickNub})`;
			} else{//有数字时
				console.log(5)
				stickNub++;
				stick.name = stick.name.replace(/\(\d+\)$/,`(${stickNub})`);
				//用replace方法或者match方法；
			}
		} 
	}
}
