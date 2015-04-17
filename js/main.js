$(function(){

	pop.preload();
	$("#start").tap(function(){
		if($(this).text()=='开始游戏'){
			pop.start();
			$(this).text('游戏开始啦!').addClass('disabled').attr('disabled',true);
		}
		
	});
	
});

var pop={

	// 初始生命
	life : 6,
	//初始行数
	col : 6,
	//基本分
	baseScore:2,
	//开始的速度
	speed:80,
	//步进速度
	step:5,
	//最大速度
	min:30,
	//图片生成的频率
	fqz:1500,
	//跳变频率
	fStep:80,
	//最大频率
	maxF:800,
	//总分
	total:0,
	// 图片数组
	norArr : [
		'img/normal/0.gif',
		'img/normal/1.gif',
		'img/normal/2.gif',
		'img/normal/3.gif',
		'img/normal/4.gif',
		'img/normal/5.gif',
		'img/normal/6.gif',
		'img/normal/7.gif',
		'img/normal/8.gif'
	],
	kilArr : [
		'img/kill/0.gif',
		'img/kill/1.gif',
		'img/kill/2.gif',
		'img/kill/3.gif'
	],
	//预加载
	preload:function(){

		$("#start").attr('disabled',true).addClass('disabled');
		var arr=[];
		arr=arr.concat(pop.norArr, pop.kilArr);

		var i=0;
		var img=new Image();
		img.src=arr[i];
		$( img ).on('load',function(){
			if(i<arr.length-1){
				i++;
				img.src=arr[i];
			}else{
				pop.init();
			}
		});
	},
	// 游戏初始化
	init:function(){
		//头部按钮加载
		var lifStr='生命:';
		// 分数清零
		$("#score").text(0);
		$("#record").text( window.localStorage.getItem('bear_maxScore') || 0 );
		for(var i=0;i<pop.life;i++){
			lifStr+='<img src="img/normal/5.gif">';
		}
		$("#blood").html(lifStr);
		var oImg=$("#blood").find('img');
		oImg.hide();
		setTimeout(function(){
			var cnt=0;
			$("#loading").fadeOut(function(){
				$(this).remove();
				$(".header h1").addClass('shake shake-constant');
				var timer=setInterval(function(){
					if(cnt>=oImg.length){
						clearInterval(timer);
					}
					$( oImg[cnt] ).show().addClass('animated bounceIn');
					cnt++;
				},80);
				setTimeout(function(){
					$(".header h1").removeClass('shake shake-constant');
					$("#start").attr('disabled',false).removeClass('disabled').text("开始游戏");
				},1000);
			});
		},2000);

	},
	moveTimer:[],
	//创建元素
	create:function(){
		var posArr=[];
		if( $(window).height()<=480 ){
			$(".main").css({
				'margin-top':'5px',
				'height':'325px'
			});
		}else{
			$(".main").css({
				'margin-top':'30px',
				'height':'400px'
			});
		}
		//计算表情图大小
		var imgWidth=Math.floor( $(".main").width() / pop.col );
		//添加所有的初始图片坐标
		for(var i=0;i<pop.col;i++){
			posArr.push(imgWidth*i);
		}
		var img=$("<img data-tap='on'>");
		img.attr('src',pop.norArr[ Math.floor( Math.random()*pop.norArr.length ) ]);
		img.width( imgWidth*0.7 );
		img.css('left',posArr[ Math.floor( Math.random()*posArr.length ) ] );
		$(".main").append($(img));
		img.timer=null;
		//图片添加事件
		$(".main").delegate('img','tap',function(ev){
			var oImg=$(this);
			//每个图片只准点击一次
			if($(this).attr('data-tap')=='on'){
				$(this).attr('src',pop.kilArr[ Math.floor( Math.random()*pop.kilArr.length ) ]);
				$(this).attr('data-tap','off' );
				$(this).addClass('shake shake-horizontal');
				var span=$("<span class='number'>+"+pop.baseScore+"</span>");
				$(".main").append( $(span) );
				$(span).css({
					"left":oImg.position().left,
					"top":oImg.position().top
				});
				$(span).addClass('animated fadeOutUp');
				$("#score").addClass('animated bounceIn');
				//点击一次之后，计算分数，增加速度,清定时器,加快图片掉落的频率
				setTimeout(function(){
					oImg.remove();
					$(span).remove();
					$("#score").removeClass('animated bounceIn');
					$("#score").text( parseInt( $("#score").text() )+pop.baseScore );
					pop.total+=pop.baseScore;
					//频率
					if(pop.total%( pop.baseScore*3 )==0){
						// 每得两次分加快一次频率
						pop.speed-=pop.step;
						//最小值
						if(pop.speed<=pop.min){
							pop.speed=pop.min;
						}
						if(pop.fqz<=pop.maxF){
							pop.fqz=pop.maxF;
						}
						pop.fqz-=pop.fStep;
						pop.start();
					}

				},500);
			}			
		});
		pop.move(img);
	},
	// 移动
	move:function(obj){

		clearInterval(obj.timer);
		obj.timer=setInterval(function(){		
			obj.css("top",obj.position().top+5);

			$(".main").find('img').each(function(idx,ele){
				var img=$(this);
				if($(this).position().top>$(this).parent().height()-$(this).height()){
					//碰撞检测
					img.hide();
					var oImg=$("#blood").find('img');
					if(oImg.length<=1){

						pop.gameover();
					}
					
					oImg.eq(oImg.length-1).attr('src','img/kill/3.gif').removeClass('bounceIn').addClass('bounceOut');
					$('.main').addClass('shake shake-constant shake-horizontal');
					setTimeout(function(){
						$('.main').removeClass('shake shake-constant shake-horizontal');
						oImg.eq(oImg.length-1).remove();
						img.remove();

					},500);

				}
			});
		},pop.speed);
	},
	// 游戏开始的控制定时器
	startTimer:null,
	//游戏开始
	start:function(){
		clearInterval(pop.startTimer);
		pop.startTimer=setInterval(function(){
			pop.create();
		},pop.fqz);
	},
	gameover:function(){
		$("#mark").show().addClass('animated bounceInDown');
		$("#sBtn").tap(function(){
			$("#share").fadeIn();
		});
		$("#reflesh").tap(function(){
			window.location.reload();
		})
		//存储最高分
		if(window.localStorage.getItem('bear_maxScore')<=pop.total ){
			window.localStorage.setItem('bear_maxScore',pop.total);
		}
		$(".main").html('');
		clearInterval(pop.startTimer);
		pop.init();

	}
}