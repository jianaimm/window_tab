//model.js 用来处理数据；
//根据指定id名，获取所有的一级子数据，返回的是一个包含对象的数组；
function getChildren(id){
	return data.list.filter(function(item){
		return item.pid == id;
	});
}
//根据指定id名，获取trash回收站下的一级子数据,返回的是一个数组；
function getTrashChildren(id){
	return data.trash.filter(function(item){
		return item.pid == id;
	})
}
//根据指定id名，获取对应的数据信息，返回的是一个对象；
function getInfo(id){
	return data.list.filter(function(item){
		return item.id == id;
	})[0];
}
//根据指定id名，获取对应的父级信息，返回的是一个对象；
function getParent(id){
	var info = getInfo(id);
	if(info){
		return getInfo(info.pid);
	}
}
//根据指定id名，获取它的所有父级,返回的是一个包含对象的数组；
function getParents(id){
	var parents = [];
	var parentInfo = getParent(id);
	if(parentInfo){
		parents.push(parentInfo);
		var more = getParents(parentInfo.id);
		parents = more.concat(parents);
	}
	return parents;
}
//根据指定ID，获取它的所有子级,返回一个数组；
function getChildrenChild(id){
	var childInfo = getChildren(id);
	var childs = [];
	childInfo.forEach(function(item){
		if(item){
			childs.push(item);
			var more = getChildrenChild(item.id);
			childs = more.concat(childs);
		}
	});
	return childs;
}

//根据指定ID，获取垃圾桶下的所有子级，返回一个数组；
function getTrashChildrenChild(id){
	var childInfo = getTrashChildren(id);
	var childs = [];
	childInfo.forEach(function(item){
		if(item){
			childs.push(item);
			var more = getTrashChildrenChild(item.id);
			childs = more.concat(childs);
		}
	});
	return childs;
}
//添加新数据；
function addData(newData){
	newData.id = getMaxId() + 1;
	createFiles(newData);//查重；
}
//获取数据中最大的id；
function getMaxId(){
	var maxId = 0;
	data.list.forEach(function(item){
		maxId = Math.max(maxId,item.id);
	});
	return maxId;
}
var newName = '';
//判断重名；--获取所有重名的文件，放到一个数组里；
function checkName(filedata){
	var sameFiles = [];
	for(var i = 0;i < data.list.length;i++){
		if(filedata.type == data.list[i].type
		&& (filedata.name == data.list[i].extname ? data.list[i].name.substring(0,5) : data.list[i].name)
		&& filedata.pid == data.list[i].pid){
			sameFiles.push(data.list[i]);
		}
	}

	return sameFiles;
}
//对生成的文件夹进行查重过滤；
function createFiles(filedata){
	var existFiles = checkName(filedata);
	if(existFiles.length){
		for(var i = 1;i <= existFiles.length;i++){
			var V = existFiles.find(function(el){
				return el.extname == i;
			});
			if(V === undefined){
				filedata.extname = i;
				break;
			}
		}
	}
	data.list.push(filedata);
}
