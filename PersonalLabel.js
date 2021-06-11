//Explanations for this javaScript code in http://zh.moegirl.org/User:AnnAngela/js
$(function() {
    $('#pt-watchlist').after('<li id="pt-backlog"><a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/分类:积压工作">积压工作</a></li><li id="pt-sandbox"><a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/User:' + mw.config.get("wgUserName") + '/SandBox">我的沙盒</a></li><li id="pt-personlog"><a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/Special:log/' + mw.config.get("wgUserName") + '">我的日志</a></li>');
});
