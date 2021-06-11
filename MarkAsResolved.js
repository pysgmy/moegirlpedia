/*
MarkAsResolved.js
by User:AnnAngela
Adapted for autoconfirmed by User:一位史蒂夫
Warning:Abuse of this tool is prohibited!
 
Original script: https://zh.moegirl.org.cn/User:AnnAngela/js/MarkAsResolved.js
 
More versions (upward compatible) :
> Goodeditor  [[User:Leranjun/MarkAsResolved.js]]
> Patroller [[User:AnnAngela/js/MarkAsResolved.js]]
*/
// <pre>
"use strict";
 
(async function () {
    if (!mw.config.get("wgPageName").startsWith("萌娘百科_talk:讨论版/")) {
        return;
    }
    if (!mw.config.get("wgUserGroups").includes("autoconfirmed")) {
        return;
    }
    mw.loader.load(mw.config.get("wgServer") + mw.config.get("wgScriptPath") + "/User:AnnAngela/js/quick-save.js/style.css?action=raw&ctype=text/css", "text/css");
    await mw.loader.using(["mw.Api", "mediawiki.Uri"]);
    var runningFlag = false;
    var container = $("<div class=\"AnnTools_Frame\" style=\"display: none;\"><div class=\"AnnTools_Frame_Head\"><div class=\"AnnTools_Frame_Title\">公共讨论页MAR工具（自确版）</div><span class=\"AnnTools_Frame_Close\">×</span></div><div class=\"AnnTools_Frame_Content\"><div class=\"AnnTools_Confirm\" id=\"AnnTools_Confirm_First\"><div class=\"AnnTools_Confirm_Content\">请问你是要标记这个段落吗？<br>段落标题：<span class=\"AnnTools_SectionTitle\"></span></div><div class=\"AnnTools_Confirm_Yes\">是呀是呀</div><div class=\"AnnTools_Confirm_No\">并不是呢</div></div><div class=\"AnnTools_Confirm AnnTools_Confirm_expand\" id=\"AnnTools_Confirm_Second\"><div class=\"AnnTools_Confirm_Content\">请问你想标记这个段落为什么状态？<br>段落标题：<span class=\"AnnTools_SectionTitle\"></span><dl><dt>状态：</dt><dd><ul class=\"AnnTools_form\"><li><input class=\"AnnTools_radio\" value=\"r\" id=\"AnnTools_radio_r\" type=\"radio\" checked=\"checked\"><label for=\"AnnTools_radio_r\">问题已解决</label></li><li><input class=\"AnnTools_radio\" value=\"p\" id=\"AnnTools_radio_p\" type=\"radio\"><label for=\"AnnTools_radio_p\">问题已答复</label></li><li><input class=\"AnnTools_radio\" value=\"w\" id=\"AnnTools_radio_w\" type=\"radio\" ><label for=\"AnnTools_radio_w\">请求被撤回</label></li><li><input class=\"AnnTools_radio\" value=\"n\" id=\"AnnTools_radio_n\" type=\"radio\"><label for=\"AnnTools_radio_n\">无人回复<s>（点名批评）</s></label></li></ul></dd><dt>前置留言：</dt><dd><input id=\"AnnTools_precomment\" type=\"text\" size=\"255\" placeholder=\"（但是如果不写就啥也没有）\"></dd><dt>留言：</dt><dd><input id=\"AnnTools_comment\" type=\"text\" size=\"255\" placeholder=\"（但是如果不写就啥也没有）\"></dd></dl></div><div class=\"AnnTools_Confirm_Yes\">就是这样</div><div class=\"AnnTools_Confirm_No\">我再想想</div><div class=\"AnnTools_status\"></div></div></div></div>").appendTo("body"),
        api = new mw.Api();
    // container.find("#AnnTools_comment").val(localStorage.getItem("AnnTools_MarkAsResolved_comment") || "");
    var offsets = {
        n: 10,
        s: 10
    };
    var toggle = function toggle(type) {
        var isHide = type === "hide";
        $(".AnnTools_form .AnnTools_radio" + (isHide ? ":not(:checked)" : "")).closest("li")[isHide ? "hide" : "show"]();
        $("#AnnTools_precomment, #AnnTools_comment").each(function (_, input) {
            var $input = $(input);
            if (!isHide || ($input.val() || "").length === 0) {
                $input.closest("dd")[isHide ? "hide" : "show"]();
                $input.closest("dd").prev()[isHide ? "hide" : "show"]();
            }
        });
        var inputs = container.find("input");
        if (isHide) {
            inputs.attr("disabled", "disabled");
        } else {
            inputs.removeAttr("disabled");
        }
    };
    container.on("click", function (event) {
        if (runningFlag) {
            return;
        }
        var target = $(event.target);
        if (target.is(".AnnTools_Frame_Close") && !target.is(".disable")) {
            container.fadeOut(370).queue(function () {
                container.find(".AnnTools_Confirm").removeAttr("style");
                $(this).dequeue();
            });
            toggle("show");
        } else if (target.is("#AnnTools_Confirm_First .AnnTools_Confirm_Yes")) {
            container.find("#AnnTools_Confirm_First").hide();
            container.find("#AnnTools_Confirm_Second").show();
        } else if (target.is("#AnnTools_Confirm_Second .AnnTools_Confirm_Yes")) {
            container.trigger("submit");
        } else if (target.is(".AnnTools_Confirm_No")) {
            container.fadeOut(370).queue(function () {
                container.find(".AnnTools_Confirm").removeAttr("style");
                $(this).dequeue();
            });
            toggle("show");
        } else if (target.is(".AnnTools_radio")) {
            target.closest(".AnnTools_form").find(".AnnTools_radio:checked").prop("checked", false);
            target.prop("checked", true);
        }
    }).on("submit", async function () {
        try {
            if (typeof Object.fromEntries !== "function") {
                throw new Error("请更新浏览器到最新版本以使用本工具（最低可用版本为 Chrome & Edge: 73+, Firefox: 63+, Safari: 12.1+）");
            }
            runningFlag = true;
            container.find(".AnnTools_Confirm_Yes, .AnnTools_Confirm_No").text("正在运行");
            container.find(".AnnTools_status").text("正在标记中……");
            toggle("hide");
            var c = $("#AnnTools_comment").val();
            var v = container.find(".AnnTools_radio:checked").val();
            var pc = $("#AnnTools_precomment").val() || "";
            var hash = container.data("sectionTitle");
            var toclist = Object.fromEntries((await api.post({
                action: "parse",
                format: "json",
                pageid: mw.config.get("wgArticleId"),
                prop: "sections"
            })).parse.sections.map(function (_ref) {
                var anchor = _ref.anchor;
                var index = _ref.index;
                return [anchor, index];
            }));
            if (!(hash in toclist)) {
                throw new Error("请移除该标题内的模板后再行操作……");
            }
            var section = toclist[hash];
            await api.postWithToken("csrf", {
                action: "edit",
                pageid: mw.config.get("wgArticleId"),
                section: section,
                summary: "标记讨论串「/* " + container.data("sectionTitle") + " */」状态为【" + container.find(".AnnTools_radio:checked + label").text() + "】",
                tags: "Automation tool",
                nocreate: true,
                appendtext: (pc.length > 0 ? "\n:" + pc + "--~~~~" : "") + "\n\n{{MarkAsResolved|time={{subst:#timel:Ymd}}|status=" + (v in offsets ? v + "|archive-offset=" + offsets[v] : v) + "|comment=" + c + "|sign=~~~~}}"
            });
            container.find(".AnnTools_status").text("编辑完成！即将刷新！").addClass("AnnTools_WorkDetail_Succeed");
            // localStorage.setItem("AnnTools_MarkAsResolved_comment", c);
            setTimeout(function () {
                location.reload(false);
            }, 1307);
        } catch (e) {
            console.error("MarkAsResolved.js", e);
            container.find(".AnnTools_status").text("发生错误：" + e);
            runningFlag = false;
            container.find(".AnnTools_Confirm_Yes").text("就是这样");
            container.find(".AnnTools_Confirm_No").text("我再想想");
            toggle("show");
        }
    });
    $("#mw-content-text > .mw-parser-output > h2, #mw-content-text > .mw-parser-output > .discussionContainer > h2").each(function () {
        var self = $(this);
        var content = self.nextUntil("h2").not("h2");
        if (content.hasClass("saveNotice") || content.hasClass("MarkAsResolved")) {
            return;
        }
        var sectionTitle = self.find(".mw-headline").attr("id");
        self.find(".mw-editsection-bracket").first().after('<span class="mw-editsection-divider"> | </span>').after('<a href="javascript:void(0)" class="AnnTools_MarkAsResolved">标记状态</a>');
        self.on("click", function (event) {
            if (!$(event.target).is(".AnnTools_MarkAsResolved") || container.is(":visible")) {
                return true;
            }
            container.find(".AnnTools_SectionTitle").text(sectionTitle);
            container.data({
                sectionTitle: sectionTitle
            }).fadeIn(370);
        });
        var quicksave = self.find(".AnnTools_QuickSave");
        if (quicksave[0]) {
            var divider = quicksave.next(".mw-editsection-divider");
            self.find(".mw-editsection .mw-editsection-bracket").first().after(divider).after(quicksave);
        }
    });
})();
// </pre>
