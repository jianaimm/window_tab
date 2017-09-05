//数据；
var upload = document.querySelector('#upload');
var data = {
	main: {
		'menu': [
			{
				'name': '新建',
				'children': [
					{
						'name': '文件夹',
						'type': 'file',
						'callBack': 'createFile'
					},
					{
						'name': '文本文档',
						'type': 'text',
						'callBack': 'createText',
						disabled: true
					}	
				],
			},
			{
				'name': '更改桌面背景',
				'callBack': 'changeTableSkin'
			},
			{
				'name': '上传文件',
				'callBack': 'upload'
			},
			{
				'name': '粘贴',
				'callBack': 'stick',
				disabled: true
			},
			{
				'type': 'splitLine'	
			},
			{
				'name': '排序方式',
				'children': [
					{
						'name': '按名称排序',
						'callBack': 'nameSort'
					},
					{
						'name': '按时间排序',
						'callBack': 'timeSort'
					},
					{
						'name': '按类型排序',
						'callBack': 'typeSort'
					}
				]
			},
			{
				'name': '刷新',
				disabled: false,
				'callBack': 'refresh'
			}
		],
		'file': [
			{
				'name': '打开',
				'callBack': 'open'
			},
			{
				'name': '重命名',
				'callBack': 'rename'
			},
			{
				'name': '删除',
				'callBack': 'del'
			},
			{
				'name': '复制',
				'callBack': 'copy'
			}
		],
		'trash': [
			{
				'name': '清空',
				'callBack': 'empty'
			},
			{
				'name': '全部还原',
				'callBack': 'restoreAll'
			}
		],
		'trashFile': [
			{
				'name': '彻底删除',
				'callBack': 'delForever'
			},
			{
				'name': '还原当前文件夹',
				'callBack': 'restoreOne'
			}
		]
	},
	list: [
		{
			id: 1,
			pid: 0,
			'type': 'trash',
			'name': '回收站',
			'time': 1234347
		},
		{
			id: 2,
			pid: 0,
			'type': 'file',
			'name': '新建文件夹',
			'time': 123434231
		},
		{
			id: 3,
			pid: 0,
			'type': 'file',
			'name': '文件夹',
			'time': 1223123434
		},
		{
			id: 4,
			pid: 0,
			'type': 'file',
			'name': '新建文件夹2',
			'time': 132323434
		},
		{
			id: 5,
			pid: 2,
			'type': 'file',
			'name': '文件夹',
			'extname': '2'
		},
		{
			id: 6,
			pid: 2,
			'type': 'file',
			'name': '新建文件夹',
			'extname': '3',
			'time': 875123434
		},
	],
	trash: []//存放回收站里的数据；
};
var arrImg = ['img/1.jpg','img/0.jpg','img/17.jpg','img/42.jpg','img/29.jpg','img/2.jpg','img/38.jpg','img/21.jpg','img/58.jpg'];
