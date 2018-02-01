mui.init();

var menu = new Swiper(".menu", {
	slidesPerView: 5,
	resistanceRatio: 0
});

var swiper = new Swiper(".panel", {
	slidesPerView: 1.1,
	spaceBetween: 10,
	resistanceRatio: 0,
	centeredSlides: true,
	watchOverflow: true,
	observer: true,
	observeParents: true
});

var scene = angular.module("scene", []);
var status = "false"; //编辑状态默认为false
scene.controller("issue", function($scope) {
	/**
	 * 构建页面对象数组
	 * 一个页面为一个数组，存放当前页素材对象
	 */
	$scope.scene = new Array(); //场景
	var page; //单个页面,存放素材对象
	var text; //文本素材对象
	var img; //图片素材对象
	//添加新页面
	$scope.addPage = function() {
		page = new Array();
		var index = swiper.activeIndex; //背景id
		page.bgUrl = "";
		page.areaId = "area" + index;
		$scope.scene.push(page);
	}

	//添加文字
	mui("body").on("tap", ".addText", function() {
		var index = swiper.activeIndex;
		if(index < $scope.scene.length) {
			mui.openWindow({
				id: "addText",
				url: "/scene/addText.html"
			});
		}
	});
	window.addEventListener("getText", function(event) {
		var value = event.detail.text;
		if(value != "" && value != " ") {
			text = {};
			//获取当前操作的下标
			var index = swiper.activeIndex;
			if(index < $scope.scene.length) {
				var zIndex = $scope.scene[index].length;
				text.content = "<div class='text'>" + value + "</div>";
				text.className = "swiper-no-swiping scenc-text";
				text.css = "z-index:" + zIndex + ";top: 100px;left:30px;";
				$scope.scene[index].push(text);
			}
			$scope.$apply(); //手动刷新
			status = "true"; //编辑状态改为true
		}
	});

	//添加图片
	$scope.addImg = function() {
		img = {};
		//获取当前操作的下标
		var index = swiper.activeIndex;
		if(index < $scope.scene.length) {
			var zIndex = $scope.scene[index].length;
			img.content = "<img src='img/photo.jpg'/>";
			img.className = "swiper-no-swiping scene-img";
			img.css = "z-index:" + zIndex + ";top: 100px;left:30px;";
			$scope.scene[index].push(img);
		}
		status = "true"; //编辑状态改为true
	}

	/**
	 * 实现素材点击后可拖拽
	 * @param {Object} index：作页面的id
	 * @param {Object} ind
	 * id：拽素材的id
	 * rId：操作拖放点的id
	 * hId：操作高度点的id
	 * wId：操作宽度点的id
	 */
	$scope.check = function(pageId, index) {
		//排他法，触发选中
		var id = "inside" + pageId + index,
			rId = "drop" + pageId + index,
			hId = "height" + pageId + index,
			wId = "width" + pageId + index;
		var all_bar = document.body.querySelectorAll(".bar");
		for(var i = 0; i < all_bar.length; i++) {
			all_bar[i].style.display = "none";
		}
		var bar = document.body.querySelectorAll("#" + id + " .bar");
		for(var i = 0; i < bar.length; i++) {
			bar[i].style.display = "block";
		}

		var elem = document.getElementById(id);
		drop(elem); //移动
		zoom(pageId, id, elem, rId, hId, wId); //缩放
	}

});

/**
 * 拖动
 * @param {Object} hammer：hammer实例
 * @param {Object} element：拖动对象
 */
var drop = function(element) {
	var hammer = new Hammer(element);
	element.style.top = getCss(element, "top");
	element.style.left = getCss(element, "left");
	var x = 0,
		y = 0;
	hammer.on("panstart", function(event) {
		x = parseInt(element.style.left);
		y = parseInt(element.style.top);
	});
	hammer.on("panmove", function(event) {
		element.style.top = y + event.deltaY + "px";
		element.style.left = x + event.deltaX + "px";
	});
}

/**
 * 缩放，类名含有scene-img则为图片，按比例缩放，显示右下角操作点
 * 没有则为文字，不按比例缩放，显示右下角，右上角，左下角操作点
 * @param {Object} index
 * @param {Object} id
 * @param {Object} elem
 */
var zoom = function(index, id, elem, rId, hId, wId) {
	if(elem.classList.contains("scene-img")) {
		var scale = new Resize(id, {
			Max: true,
			mxContainer: index,
			Scale: true
		});
		scale.Set(rId, "right-down");
		scale.Set(hId, "left-down");
		scale.Set(wId, "right-up");
	} else {
		var scale = new Resize(id, {
			Max: true,
			mxContainer: index
		});
		scale.Set(rId, "right-down");
		scale.Set(hId, "left-down");
		scale.Set(wId, "right-up");
	}
}

//获取相关CSS属性
var getCss = function(elem, key) {
	return window.getComputedStyle(elem)[key];
};

//保存
var save = function() {
	console.log("保存");
}

/*
 * 调用$compile服务
 * 手动编译动态生成html代码中的指令
 */
scene.directive("compile", function($compile) {
	return function(scope, element, attrs) {
		scope.$watch(
			function(scope) {
				return scope.$eval(attrs.compile);
			},
			function(value) {
				element.html(value);
				$compile(element.contents())(scope);
			}
		);
	};
});

//返回
mui.back = function() {
	if(status == "true") {
		document.getElementById("widget").style.display = "block";
		document.getElementById("shade").style.display = "block";
	} else {
		var view = plus.webview.currentWebview();
		view.close("auto");
	}
}

//不保存
var bin = function() {
	cShade();
	var view = plus.webview.currentWebview();
	view.close("auto");
}

//弹窗保存
var toSave = function() {
	cShade();
	save();
}

//取消
var cShade = function() {
	document.getElementById("widget").style.display = "none";
	document.getElementById("shade").style.display = "none";
}