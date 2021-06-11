$(function(){	
	// 小头像放大镜
	setTimeout(function(){
		$('.userlink-avatar').hover(function(){
			var imgUrl = $(this).find('.userlink-avatar-small:first').attr('src')
			var container = $('<div id="userHeadMagnifier" style="display:inline-block; padding:10px; background:white; border:1px black solid; position:absolute; top:-139px; left:-135px;">')
			.append('<img src="' + imgUrl + '" width="128">')
			
			$(this).css('position', 'relative').append(container)
		}, function(){
			$(this).css('position', 'static').find('#userHeadMagnifier').remove()
		})			
	}, 1000)
	
	// 阻止复制时添加版权信息
	$('#mw-content-text').off('copy')
	
	// action=purge页面自动点击刷新
	if(! location.search){
		$("#p-cactions ul").append('<li id="btn-renovate"><a title="刷新此页">刷新此页</a></li>')
		$('#btn-renovate').click(function(){
			mw.notify('刷新中...', { type : 'warn' })
			var url = decodeURIComponent(location.href)
			var pageName = url.replace(/^https:\/\/zh\.moegirl\.org\.cn\/(.+)$/, '$1')
			var api = new mw.Api()
			var deferredTimeoutKey = 0
			$.ajax({
				url: 'https://zh.moegirl.org.cn/api.php',
				type: 'post',
				timeout: 10000,
				data: {
					"action": "purge",
					"format": "json",
					"titles": pageName
				}
			}).done(function(){
				location.reload(true)
			}).fail(function(e){
				mw.notify('网络错误，刷新失败！', { type : 'error' })
			})
		})
	}
	
	// tab键改为输出2个空格
	$('#wpTextbox1').keydown(function(e){
		if(e.keyCode == 9){
			e.preventDefault()
			var position = this.selectionStart,
			left = this.value.substring(0, position),
			right = this.value.substring(position),
			code = left + '  ' + right
			this.value = code
			this.selectionStart = this.selectionEnd = position + 2
		}
	})
	
	// AJAX编辑预览代替方案（快捷键为：ctrl + shift + s）
	if(/((?!\.css|\.js|模块|module).+)action=(edit|submit)/.test(location.href)){
		setTimeout(function(){
			$('#wikiEditor-ui-toolbar .tabs').append($('<span id="edit-ajaxPreviewBtn" class="tab"><a href="#" role="button" aria-pressed="false">预览</a></span>'))
			$('#edit-ajaxPreviewBtn').click(foo)
		}, 3000)
		var removeBtn = $('<div id="edit-ajaxPreviewRm" style="width:43px; height:30px; text-align:center; line-height:30px; color:black; font-size:26px; background:white; box-shadow:0 0 5px black; opacity:0.8; position:fixed; top:20px; right:0; cursor:pointer; display:none; z-index:1001;">×</div>')
		.click(function(){
			viewHide()
		})
		$('body').append(removeBtn)
		
		var saveBtn = $('<div id="edit-ajaxPreviewSave" style="width:43px; height:30px; text-align:center; line-height:30px; color:black; font-size:26px; background:white; box-shadow:0 0 5px black; opacity:0.8; position:fixed; top:73px; right:0; cursor:pointer; display:none; z-index:1001;">√</div>')
		.click(function(){
			$('#wpSave').click()
		})
		$('body').append(saveBtn)
 
		var requestTimeoutKey = 0,
		deferred = null
		function viewHide(){
			deferred && deferred.abort()
			clearTimeout(requestTimeoutKey)
			$('#edit-ajaxPreview').remove()
			$('#edit-ajaxPreviewRm').hide()
			$('#edit-ajaxPreviewSave').hide()
			$('body').css('overflow', 'visible')
		}
	
		$(window).keydown(function(e){
			if(e.ctrlKey && e.keyCode == 83){
				if($('#edit-ajaxPreview').length){
					viewHide()
				}else{
					foo(e)
				}
			}
		})
		
		var api = new mw.Api()
		function foo(e){
			var previewElement = $('<div id="edit-ajaxPreview" style="width:90%; min-width:800px; height:90%; min-height:400px; padding:15px; background:white; box-shadow:0 0 15px #666; overflow:auto; position:fixed; margin:auto; top:0; left:0; right:0; bottom:0; z-index:1000;">').append('<span id="edit-ajaxPreview-LoadingMsg" style="font-size:30px; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%);">获取预览中...</span>')
			$('body').append(previewElement)
 
			var wikiText = $('#wpTextbox1').val(),
			titleName = decodeURIComponent(location.href.replace(/^.+[?&]title=([^&]+)&.+$/, '$1'))
			$('#edit-ajaxPreviewRm').show()
			$('#edit-ajaxPreviewSave').show()
			$('body').css('overflow', 'hidden')
			deferred = api.post({
				"action": "parse",
				"format": "json",
				"text": wikiText,
				"title": titleName,
				"contentmodel": "wikitext"
			}).done(function(data){
				$('#edit-ajaxPreview').html($(data.parse.text['*']).addClass('mw-body-content'))
			})
			requestTimeoutKey = setTimeout(function(){
				if(deferred.state() != 'resolved'){
					viewHide()
					foo(e)
				}
			}, 8000)
			return false
		}
	}
	
	// ctrl + alt快速添加变量命名空间
	if (mw.config.values.wgAction == "edit" || mw.config.values.wgAction == "submit"){
		var editor = $('#wpTextbox1')
		var title = mw.config.values.wgTitle.replace(/./, function(s){
			return s.toLowerCase()
		})
		editor.keydown(function(e){
			if(e.ctrlKey && e.altKey){
				editor.val(editor.val().replace(/(\{\{#var(define|):)([^\|\}]+)/g, function(s, s1, s2, s3){
					if(!new RegExp('^' + title + '\\.').test(s3)){
						if(['num', 'key', 'value', 'time', 'times'].includes(s3)){ return s }
						return s1 + title + '.' + s3 
					}
					
					return s
				}))
				
				mw.notify('已添加变量命名空间。')
			}
		})
	}
})
 
// $.getScript("/User:Imbushuo/MonacoEditor/MediaWikiTokenizer.js‎?action=raw&ctype=text/javascript",
// function (data, textStatus, jqxhr) {
//     $.getScript("/User:imbushuo/MediaWikiLint.js‎?action=raw&ctype=text/javascript", 
//     function (data, textStatus, jqxhr) {
//         // Loader for Monaco editor
//         mw.loader.load('https://zh.moegirl.org/User:Imbushuo/MonacoEditor.js?action=raw&ctype=text/javascript');
//     });
// });
 
 
// 搜索引擎代替方案
/*
$(function(){
	var input = $('#searchInput').attr('placeholder', '搜索萌娘百科')
	$('#searchButton').off().on('click', function() {
	    var keyword = input.val();
	    if (!keyword) window.alert('请输入关键词后再行搜索！');
	    else {
	        var self = $(this),
	            check_url = 'https://zh.moegirl.org/' + keyword,
	            open_url = 'https://www.bing.com/search?q=' + encodeURIComponent(keyword) + '+site%3Azh.moegirl.org&ie=UTF-8';
	        self[0].disabled = true;
	        self.data({
	            'background-image': self.css('background-image'),
	            'background-size': self.css('background-size')
	        });
	        self.css({
	            'background-image': 'url(https://static.mengniang.org/common/d/d1/Windows_10_loading.gif)',
	            'background-size': '80%'
	        });
	        $.ajax({
	            url: check_url,
	            type: 'HEAD',
	            success: function(_, __, response) {
	                if (response.status < 400) location.href = check_url;
	                else this.error();
	            },
	            error: function() {
	                location.href = open_url
	            },
	            complete: function() {
	                self[0].disabled = false;
	                self.css(self.data());
	            }
	        });
	    }
	    return false;
	});
})
*/
