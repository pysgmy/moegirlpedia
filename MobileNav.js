/*
MobileNav.js
by User:NHJR
 
Original script: https://zh.moegirl.org.cn/User:NHJR/common.js
*/
// <pre>
//加载内链脚本
function loadScript(scriptPath){
    var pageTitle = encodeURIComponent(scriptPath);
    mw.loader.load("https://zh.moegirl.org.cn/index.php?title=" + pageTitle + "&action=raw&ctype=text/javascript");
}
//是否为移动版
var isMobile = window.location.href.indexOf("mzh.moegirl.org") != -1;
function mobile(onMobile){
    if(isMobile){
        onMobile();
    }
}
function desktop(onDesktop){
    if(!isMobile){
        onDesktop();
    }
}
//添加Navbox
function addNavbox(){
    var pageName = mw.config.get("wgPageName");
    $.get("https://mzh.moegirl.org.cn/api.php",{action:"parse",page:pageName,format:"json"},function(data,status){
        if(status == "success"){
            var desktopView = $($.parseJSON(data.replace("\"*\"","\"data\"")).parse.text.data);
            var navbox = desktopView.find(".navbox");
            navbox.each(function(){
                //查论编
                var viewTemplateLink = $(this).find("div.hlist.navbar").first();
                var templateView = $("<div class=\"plainlinks\" style=\"color:#aaa;transform:translate(-1.7px,20.9px);\">[本模板:</div>");
                templateView.append($(viewTemplateLink.html()));
                templateView.append("]");
                templateView.find("span").removeAttr("style");
                $("div.mw-parser-output").first().append(templateView);
                $("div.mw-parser-output").first().append($(this));
            });
            loadScript("MediaWiki:Mobile.js");
        }else{
            alert("发生甚么事了");
        }
    },"text");
}
mobile(function(){
    if($("div.mw-parser-output")[0] !== undefined){
        var currentNavbox = $(document).find(".navbox");
        if(currentNavbox.length === 0){
            addNavbox();
        }
    }
});
// </pre>
