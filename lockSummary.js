/*
	加载后将在摘要栏右侧生成一个小锁图标，在锁定时打开编辑页面就会自动在摘要栏中添加最后一次上锁时摘要栏中的文字
*/
 
$(function(){
	if(! /action=(edit|submit)/.test(location.href)){ return false }
	var lockIcon = 'https://i.loli.net/2018/08/12/5b6f8ffac3db6.png',
	lockedIcon = 'https://i.loli.net/2018/08/12/5b6f85c3134fe.png',
	summary = $('#wpSummary')
	setTimeout(function(){
		var locked = localStorage.getItem('lockSummary-locked')
		var statusIcon = lockIcon
		if(locked){
			var text = localStorage.getItem('lockSummary-text')
			summary.val(text)
			new mw.Api().get({
				"action": "parse",
				"format": "json",
				"summary": text,
				"prop": ""
			}).done(function(data){
				if(! $('.mw-summary-preview .comment').length){
					$('#wpSummaryLabel').after('<div class="mw-summary-preview">编辑摘要的预览： <span class="comment" style="font-style:italic;"></span></div>')
				}
				$('.mw-summary-preview .comment').html('（' + data.parse.parsedsummary['*'] + '）')
			})
			var statusIcon = lockedIcon
		}
		$('#wpSummaryWidget').append('<img src="' + statusIcon + '" id="lockSummary" style="width:25px; position:absolute; top:0; right:0; transform:translateY(calc(-100% - 2px)); cursor:pointer;" />')
		$('#lockSummary').click(function(){
			if(! locked){
				localStorage.setItem('lockSummary-text', summary.val())							
				localStorage.setItem('lockSummary-locked', 'true')
				locked = true
				$(this).attr('src', lockedIcon)			
			}else{
				localStorage.removeItem('lockSummary-locked')
				locked = false
				$(this).attr('src', lockIcon)
			}
		})
	}, 1000)
})
