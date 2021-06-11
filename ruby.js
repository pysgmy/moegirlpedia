/*
该插件是一个歌词注音插件，使用了雅虎日本的文本解析API：ルビ振り。
载入该插件后，在编辑页面右上角的搜索栏左边“更多”中，将添加一个“注音工具”按钮，点击即可呼出该插件的操作界面。
说明一下主要使用方式以及4个功能按钮：
基本用法：左边为一个编辑框，你可以将要注音的歌词粘贴到这个编辑框，点击“添加注音”按钮。待处理完成后，编辑框的将变成ruby注音后的歌词，并在右侧显示预览。
按钮介绍：
获取歌词：将从源代码中第一个指定格式[1] 的LyricsKai模板或其衍生模板的original参数中获取歌词到编辑框中，若源代码中不存在则提示。
添加注音：对编辑框中的文字执行注音，并在完成后显示预览。
          需要注意要注音的内容中不能包含日语当用汉字中不存在的汉字（如日语中不使用的中文简体字等），或一些特殊字符（如心形等），
          如果包含将导致注音失败，并提示。
提交歌词：将编辑框中的文字提交至页面中第一个指定格式[1] 的LyricsKai模板或其衍生模板的original参数中，这将覆盖original参数中原本的内容，若源代码中不存在则提示。
复制歌词：将编辑框中的文字复制至剪切板。
开关介绍：
书面语注音：对一些单词进行书面语的注音，如：「明日」(あした => あす)，多用于一些比较文艺的歌。
			目前该替换规则为手动维护，替换规则也只有几条，功能有限。
[1]：模板传入了original和translated参数，并且original在前，translated在后，这也是目前使用LyricsKai模板的最普遍形式。
 @@ 感谢User:Nzh21 提供了服务器资源 @@
*/
if(/((?!\.css|模块|module).+)action=(edit|submit)/.test(location.href)){
	var common = [
		['柄', 'え', 'がら'],
		['花柄', 'かへい', 'はながら'],
		['今日', 'こんにち', 'きょう'],
		['大人', 'だいにん', 'おとな'],
		['背筋', 'はいきん', 'せすじ']
	]
	
	var kakikotoba = [
		['水面', 'すいめん', 'みなも'],
		['明日', 'あした', 'あす']
	]
	
	var escapes = /[àâäèéêëîïôœùûüÿçÀÂÄÈÉÊËÎÏÔŒÙÛÜŸÇ？！·♡⸱]/g
	
	$(function(){
	  var rubyHtml = [
	    '  <div id="widget-ruby" style="display:none;">',
	    '    <div id="widget-ruby-hide">×</div>',
	    '    <div class="ruby-left">',
	    '      <div class="ruby-editor">',
	    '        <textarea id="ruby-editor-body" lang="ja"></textarea>',
	    '        <div class="ruby-btn-group">',
	    '          <button id="ruby-getText" title="从模板中获取歌词">获取歌词</button>',
	    '          <button id="ruby-execute" title="对内容添加注音">添加注音</button>',
	    '          <button id="ruby-update" title="将歌词提交至模板">提交歌词</button>',
	    '          <button id="ruby-copy" title="复制歌词至剪切板">复制歌词</button>',
	    '		   <label for="ruby-kakikotoba" title="是否应用书面语注音规则，如：「明日」(あした => あす)，多用于一些比较文艺的歌" style="display:inline-table; margin-left:10px; background:#eee; padding:3px; border-radius:3px;">',
	    '		     <input type="checkbox" id="ruby-kakikotoba" style="vertical-align:-2px;" />',
	    '            <span style="font-size:14px;">书面语注音</span>',
	    '		   </label>',
	    '        </div>',
	    '      </div>',
	    '    </div>',
	    '    <div class="ruby-right">',
	    '      <div class="ruby-view" lang="ja"></div>',
	    '    </div>',
	    '  </div>',
	    '  <style>',
	    '    #widget-ruby{',
	    '      position: fixed;',
	    '      top: 0;',
	    '      left: 0;',
	    '      bottom: 0;',
	    '      right: 0;',
	    '      z-index: 100;',
	    '      background-color: rgba(0, 0, 0, 0.3);',
	    '    }',
	    '    #widget-ruby-hide{',
	    '      font-size: 30px;',  
	    '      font-weight: bold;',  
	    '      color: white;',  
	    '      font-family: SimSun;',  
	    '      position: fixed;',  
	    '      top: 10px;',  
	    '      right: 20px;',  
	    '      transition: transform 0.3s;',  
	    '      z-index: 10001;',  
	    '      cursor: pointer',  
	    '    }',
	    '    #widget-ruby-hide:hover{',
	    '      transform: rotate(90deg);',
	    '    }',
	    '    .ruby-left, .ruby-right{',
	    '      width: 50%;',
	    '      height: 100%;',
	    '      float: left;',
	    '      position: relative;',
	    '    }',
	    '    .ruby-editor-body, .ruby-btn-group{',
	    '      margin: 10px;',
	    '    }',
	    '    .ruby-editor, .ruby-view{',
	    '      width: 450px;',
	    '      height: 80%;',
	    '      min-height: 300px;',
	    '      position: absolute;',
	    '      top: 0; left: 0; bottom: 0; right: 0;',
	    '      margin: auto;',
	    '      background-color: white;',
	    '      border: 3px #ccc solid;',
	    '    }',
	    '    #ruby-editor-body{',
	    '      width: 100%;',
	    '      height: 100%;',
	    '      box-sizing: border-box;',
	    '      resize: none;',
	    '      padding: 5px;',
	    '      outline: none;',
	    '    }',
	    '    .ruby-btn-group{',
	    '      height: 20%;',
	    '      min-height: 70px;',
	    '    }',
	    '    .ruby-view{',
	    '      overflow: auto;',
	    '      padding: 5px;',
	    '    }',
	  '  </style>'].join('');
	
	  $('body').append(rubyHtml)
	  $('#p-cactions ul').append('<li id="btn-ruby"><a title="为日语歌词进行注音">注音工具</a></li>')
	  $('#btn-ruby').click(function(){
	    $('#widget-ruby').fadeIn(200)
	  })
	
	  var editor = $('#ruby-editor-body'),
	  view = $('.ruby-view').eq(0),
	  wikiEditor = $('#wpTextbox1'),
	  hideBtn = $('#widget-ruby-hide'),
	  getTextBtn = $('#ruby-getText'),
	  executeBtn = $('#ruby-execute'),
	  updateBtn = $('#ruby-update'),
	  copyBtn = $('#ruby-copy')
	
	  var messages = {
	    notFound: '代码中并未找到歌词模板(LyricsKai及其衍生模板)！',
	    badFormat: '歌词模板的格式不正确或不受支持，请手动复制粘贴！',
	    emptyText: '要注音的内容不能为空！',
	    badText: '无法注音，请检查内容中是否包含特殊字符或非日语当用汉字、除拉丁字母以外的文字',
	    timeout: '请求超时！'
	  }
	
	  hideBtn.click(function(){
	    $('#widget-ruby').fadeOut(200)
	  })
	
	  var regex = /(\{\{[Ll]yricsKai[\s\S]*?\|original=)([\s\S]*?)(\|translated)/
	  getTextBtn.click(function(){
	    var codeContent = wikiEditor.val()
	    if(!/\{\{[Ll]yricsKai/.test(codeContent)){
	      mw.notify(messages.notFound, { type: 'error' })
	    }else{
	      if(!codeContent.match(regex)){
	        mw.notify(messages.badFormat, { type: 'error' })
	      }else{
	        var text = codeContent.match(regex)[2]
	        editor.val(text.trim())
	      }
	    }
	  })
	
	  executeBtn.click(function(){
	    var text = editor.val().trim()
	    if(text.length == 0){
	      mw.notify(messages.emptyText, { type: 'error' })
	    }else{
	      function ruby(kanji, kana){
	        return '{{photrans|' + kanji + '|' + kana + '}}'
	      }
	      
	      text = text.replace(escapes, function(s){ return '!UNICODE(' + escape(s).replace('%', '#') + ')' })
	
	      editor.attr('disabled', 'disabled')
	      $.ajax({
	        type: 'post',
	        url: 'https://api.nzh21.site/ruby.php',
	        data: { text },
	        timeout: '15000',
	      }).always(function(){
	        editor.removeAttr('disabled')
	      }).done(function(data){
	        if('Message' in data){
	          mw.notify(messages.badText, { type: 'error' })
	        }else{
	          var wordList = data.Result.WordList.Word
	          var result = ''
	
			  if(wordList.constructor == Object){
			  	result = ruby(wordList.Surface, wordList.Furigana)
			  }else{
		          $.each(wordList, function(){
		            if('Furigana' in this){
		              if('SubWordList' in this){
		                $.each(this.SubWordList.SubWord, function(key, SubWord){
		                  if(SubWord.Surface != SubWord.Furigana){
		                    result += ruby(SubWord.Surface, SubWord.Furigana)
		                  }else{
		                    result += SubWord.Surface
		                  }
		                })
		              }else{
		                result += ruby(this.Surface, this.Furigana)
		              }
		            }else{
		              result += typeof this.Surface == 'object' ? '\n' : this.Surface
		            }
		          })			  	
			  }
	          
	          result = result.replace(/#####/g, ' ')
	          
	          function rubyReplace(patterns){
		          for(var i=0, len=patterns.length; i < len; i++){
		          	var regex = new RegExp('(\\{\\{photrans\\|' + patterns[i][0] + '|)' + patterns[i][1] + '\\}\\}', 'g')
		          	result = result.replace(regex, '$1' + patterns[i][2] + '}}')
		          }
	          }
	          
	          rubyReplace(common)
	          $('#ruby-kakikotoba').prop('checked') && rubyReplace(kakikotoba)
	          result = result.replace(/!UNICODE\((.+?)\)/g, function(s, s1){ return unescape(s1.replace('#', '%')) })
	          
	          editor.val(result)
	
	          var viewHtml = result.replace(/\n/g, '<br>').replace(/\{\{photrans\|(.+?)\|(.+?)\}\}/g, '<ruby>$1<rt>$2</rt></ruby>')
	          
	          view.html(viewHtml)
	        }
	      }).fail(function(e){
	        mw.notify(messages.timeout, { type: 'error' })
	      })
	    }
	  })
	
	  updateBtn.click(function(){
	    var codeContent = wikiEditor.val()
	    var ruby = '\n' + editor.val() + '\n\n'
	    if(!regex.test(codeContent)){
	      mw.notify(messages.badFormat, { type: 'error' })
	    }else{
		  if(editor.attr('disabled') == 'disabled'){
		  	mw.notify('请先等待注音执行完毕')
		  	return
		  }
	      wikiEditor.val(codeContent.replace(regex, '{{photrans/button}}\n' + '$1' + ruby + '$3'))
	      mw.notify('提交成功！', { type:'warn' })
	      hideBtn.click()
	    }
	  })
	
	  copyBtn.click(function(){
	    editor.focus()
	    document.execCommand('selectAll')
	    document.execCommand('copy')
	    mw.notify('已复制至剪切板', { type:'warn' })
	  })
	})
}
