//Explanations for this javaScript code in http://zh.moegirl.org/User:AnnAngela/js
// <pre>
$(function() {
    var items = {
        "#t-upload": {
            "t-expandtemplates": '<li id="t-expandtemplates"><a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/index.php?title=Special:%E5%B1%95%E5%BC%80%E6%A8%A1%E6%9D%BF&wpRemoveComments=1&wpInput={{' + mw.config.get("wgPageName") + '}}">展开模板</a></li>',
            "t-Prefixindex": '<li id="t-Prefixindex"><a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/index.php?title=Special%3A前缀索引&prefix=' + mw.config.get("wgTitle") + '&namespace=' + mw.config.get("wgNamespaceNumber") + '">前缀页面</a></li>',
            "t-pagelog": '<li id="t-pagelog"><a href="//zh.moegirl.org/index.php?title=Special:%E6%97%A5%E5%BF%97&page=' + mw.config.get("wgPageName") + '">页面日志</a></li>',
            "t-replacetext": '<li id="t-replacetext" class="sysop-show"><a href="/Special:替换文本">替换文本</a></li>'
        },
        "#n-recentchanges": {
            "n-log": '<li id="n-log"><a href="/Special:log" title="所有日志">所有日志</a></li>'
        }
    }
    for (var t in items) {
        var target = $(t);
        for (var i in items[t]) {
            if (!document.getElementById(i)) {
                target.after(items[t][i]);
            }
        }
    }
    mw.loader.addStyleTag("#t-expandtemplates, #t-userlog, .ns-2 #t-pagelog, .ns-3 #t-pagelog, .ns--1 #t-pagelog {display:none;}.ns-10 #t-expandtemplates, .ns-2 #t-userlog, .ns-3 #t-userlog {display:list-item!important;}");
    $('#t-log a').text("用户日志");
});
// </pre>
