(function(mw){
mw.loader.implement('BB2LyricMaker',function() {
	analysisLrc = function (lrc) {
	var analysisedLyric = [] ;//去除时间戳和标签的歌词存放的数组
	var lyric = lrc.split('\n'); //根据换行符分行
	for (var i = 0; i < lyric.length; i++){ //读取每行歌词并去除标签
		var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g; //匹配时间戳的正则
		var dataTagReg = /\[(ar|ti|al|by|offset):(.+)\]/g; //匹配标签的正则
		lrcline = lyric[i];
		if (lrcline === '') break; //如果当前行为空则退出循环
		timeFlag = (lrcline.match(timeReg)) ? true : false; //检查该行是否有时间戳
		dataTagFlag = (lrcline.match(dataTagReg)) ? true : false; //检查该行是否有信息标签
		if (!timeFlag && !dataTagFlag) { //如无任何标签则退出
			alert("不是有效的lrc文件");
			break;
		}
		(dataTagFlag) ? lrcline = lrcline.replace(dataTagReg, '') : lrcline = lrcline.replace(timeReg, ''); //删除标签
		if (lrcline !== '' && lrcline != ' ') analysisedLyric.push(lrcline); //去除空行并将剩余歌词存入数组
		}
		return analysisedLyric;
	},
 
separateLyric = function(lrc, noTranslate) {
	var analysisedLyric = analysisLrc(lrc);
	var transList = {};
	var oriList = [];
	var scmlReg = /(作词|作詞|作曲|编曲|編曲|演唱|TV)/;
	var spliter = /[\/／【〖]/g;
	var bracketEnd = /[】〗/／]/g;
	for (var i = 0; i < analysisedLyric.length; i++) {
		if (scmlReg.test(analysisedLyric[i])) continue;
		if (analysisedLyric[i].match(spliter) === null && noTranslate === false){
			alert("无可识别的分隔符，请确认原文和译文间分隔符为 / ／ 【 〖 或勾选“本歌词暂无翻译。如以上条件均符合，请删去歌曲标题等内容");
			break;
		}
		lyricList = analysisedLyric[i].split(spliter);
		oriText = lyricList[0];
		if (lyricList[1]){
			transText = lyricList[1];
			transText = transText.replace(bracketEnd,'');
			transList[oriText] = transText;
		}
		oriList.push(oriText);
	}
return [oriList, transList];
},
insertTemplate = function() {
	var noTranslate = $("#noTranslate").is(':checked');
	var separatedLyric = separateLyric($("#lyricText").val(), noTranslate);
	var oriList = separatedLyric[0];
	var transList = separatedLyric[1];
	separatedLyric = null;
	var lb_color = $("#lb-color").val();
	var rb_color = $("#rb-color").val();
			var lyricContent = '{{Lyrics \n|lb-color='+ lb_color+ '\n|rb-color=' + rb_color+'\n';
			for (var i = 0; i < oriList.length; i++) {
				var oriText = oriList[i];
				if (transList[i] !== null) transText = transList[oriText];
				if (transText) {
				lyricContent = lyricContent + '|lb-text'+(i+1)+'='+oriText+'\n|rb-text'+(i+1) +'='+transText+'\n';
				}
				else {
				lyricContent = lyricContent + '|lb-text'+(i+1)+'='+oriText+'\n|rb-text'+(i+1)+'='+'\n';
				}
			}
			lyricContent = lyricContent + '}}';
		$('#lyricText').val(lyricContent);
		return lyricContent;
	},
lyricMaker = function() {
	if (window.location.href.indexOf("action=edit")!= -1){
	$('<script src="https://cdn.bootcss.com/twitter-bootstrap/3.4.1/js/bootstrap.js"></script>').appendTo('head');
	$('<link href="https://cdn.bootcss.com/twitter-bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet">').appendTo('head');
	$('<div class="modal fade" id = "modal_fade">').appendTo('body');
	$('<div class="modal-dialog" id = "modal_dialog"></div>').appendTo('#modal_fade');
	$('<div class="modal-content" id = "modal_content"></div>').appendTo('#modal_dialog');
	$('<div class="modal-header" id = "modal_header></div>').appendTo('#modal_content');
	$('<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>').appendTo('#modal_header');
	$('<h4 class="modal-title">LyricMaker</h4>').appendTo('#modal_header');
	$('<div class="modal-body form-group" id = "modal_body"></div').appendTo('#modal_content');
	$('<textarea class="form-control" id = "lyricText" style = "height:400px;"></textarea>').appendTo('#modal_body');
        $('<div class="modal-footer" id = "modal_footer"></div>').appendTo('#modal_content');
        $('<div class="row" id = "modal_footer_input"></div>').appendTo('#modal_footer');
        $('<label class="control-label col-lg-1" id = "lb-color-text">lb-color</label>').appendTo('#modal_footer_input');
        $('<div class="col-lg-3"><input class="form-control" id = "lb-color" placeholder="lb-color"></div>').appendTo('#lb-color-text');
        $('<label class="control-label col-lg-1" id = "rb-color-text">rb-color</label>').appendTo('#modal_footer_input');
        $('<div class="col-lg-3"><input class="form-control" id = "rb-color" placeholder="rb-color"></div>').appendTo('#rb-color-text');
	$('<div class="checkbox col-lg-3"><label><input type="checkbox" id="noTranslate">本歌词暂无翻译</label></div>').appendTo('#modal_footer_input');
	$('<div class="row"><button class="btn btn-default" onClick="insertTemplate()">转换！</button></div>').appendTo('#modal_footer');
	$('<button type="button" data-toggle="modal" data-target="#modal_fade">LyricMaker</button>').appendTo('div.editButtons');
	}
},
lyricMaker();
});
})(mediaWiki);
