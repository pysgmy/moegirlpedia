/*
Label.js
by User:AnnAngela
Modified by User:一位史蒂夫
 
Original script: https://zh.moegirl.org.cn/User:AnnAngela/js/PersonalLabel.js
*/
$(function() {
    $('#pt-watchlist').before('<li id="pt-todo"><a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/User:' + mw.config.get("wgUserName") + '/ToDoList">待办任务</a></li>');
    $('#pt-backlog').after('<li id="pt-activity"><a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/Special:维护组最后活跃列表">内卷列表</a></li>');
});
