/*
GlobalUsageChecker.js
Made with ♥ by User:Leranjun
 
This user script is meant to be used on Moegirl Commons only.
*/
$(function() {
    if (mw.config.get("wgSiteName") !== "萌娘共享" || mw.config.get("wgNamespaceNumber") !== 6) {
        return;
    }
    mw.loader.using("oojs-ui-core").done(function() {
        let button = new OO.ui.ButtonWidget({
            label: "检查主站链入",
            flags: "progressive"
        });
        button.on("click", function() {
            button.setDisabled(true);
            const pageName = mw.config.get("wgPageName");
 
            window.gucCallback = function(response) {
                window.gucResponse = window.gucResponse || response;
                const pages = response.query.pages;
                let result = "未知错误。",
                    type = "error";
                if (typeof pages["-1"] === "undefined") {
                    result = "错误：此页面不是文件。";
                    type = "error";
                } else if (typeof pages["-1"].fileusage !== "undefined") {
                    result = "警告：文件" + pageName + "于主站有链入。<a href=\"https://zh.moegirl.org.cn/Special:WhatLinksHere/" + pageName + "\">查看链入</a>";
                    type = "warn";
                } else {
                    result = "文件" + pageName + "于主站无链入。";
                    type = "info";
                }
                mw.notify($("<span></span>").html(result), {
                    title: "Global Usage Checker",
                    type: type,
                    tag: "guc"
                });
                button.setDisabled(false);
            };
 
            if (typeof window.gucResponse === "undefined") {
                let s = document.createElement("script");
                s.src = "https://zh.moegirl.org.cn/api.php?action=query&format=json&prop=fileusage&fulimit=1&titles=" + pageName + "&callback=gucCallback";
                $("body").append(s);
            } else {
                gucCallback(window.gucResponse);
            }
        });
        $("#filelinks").after(button.$element);
    });
});
