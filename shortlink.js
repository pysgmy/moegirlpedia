/* eslint-disable prefer-arrow-callback */
/* eslint-disable prefer-template */
/* eslint-disable comma-dangle */
/* eslint-disable no-var */
"use strict";
$(function () {
    var wgArticleId = mw.config.get("wgArticleId") || -1;
    var wgCurRevisionId = mw.config.get("wgCurRevisionId") || -1;
    var wgRevisionId = mw.config.get("wgRevisionId") || -1;
    var wgDiffOldId = mw.config.get("wgDiffOldId") || -1;
    var wgDiffNewId = mw.config.get("wgDiffNewId") || -1;
    if (wgArticleId <= 0 && wgRevisionId <= 0 && wgCurRevisionId <= 0 && wgDiffOldId <= 0 && wgDiffNewId <= 0) {
        return;
    }
    var $body = $("body");
    var $mwPanel = $("#mw-panel");
    $body.css("height", "auto");
    var links = [{
        id: "page",
        href: "curid=" + wgArticleId,
        title: "本页面的短链接（页面ID）",
        text: "本页短链",
        wikitext: "[[Special:重定向/page/" + wgArticleId + "]]",
    }, {
        id: "currev",
        href: "oldid=" + wgCurRevisionId,
        title: "本页面最新版本的短链接（版本ID）",
        text: "最新版本",
        wikitext: "[[Special:固定链接/" + wgCurRevisionId + "]]",
    }];
    if (wgCurRevisionId !== wgRevisionId && wgRevisionId > 0) {
        links.push({
            id: "rev",
            href: "oldid=" + wgRevisionId,
            title: "本页面当前版本的短链接（版本ID）",
            text: "当前版本",
            wikitext: "[[Special:固定链接/" + wgRevisionId + "]]",
        }, {
            id: "curdiff",
            href: "diff=" + wgCurRevisionId + "&oldid=" + wgRevisionId,
            title: "与本页面最新版本的差异的短链接（版本ID）",
            text: "与最新版本差异",
            wikitext: "[[Special:差异/" + wgRevisionId + "/" + wgCurRevisionId + "]]",
        });
    }
    if (wgDiffNewId > 0) {
        links.push({
            id: "diff",
            href: "diff=" + wgDiffNewId + "&oldid=" + wgDiffOldId,
            title: "当前比较的差异的短链接（版本ID）",
            text: "当前比较的差异",
            wikitext: "[[Special:差异/" + wgDiffOldId + "/" + wgDiffNewId + "]]",
        });
    }
    $mwPanel.append('<div class="portal" role="navigation" id="p-sl" aria-labelledby="p-sl-label" style="position: sticky; top: 0;"><h3 lang="zh-CN" dir="ltr" id="p-sl-label">短链</h3><div class="body"><ul>' +
        links.map(function (l) {
            return '<li id="sl-' + l.id + '"><a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + "/index.php?" + l.href + '" title="' + l.title + '">' + l.text + '</a><br><span>（<a data-wikitext="' + l.wikitext + '" href="javascript:void(0);">复制对应wikitext</a>）</span></li>';
        }).join("\n") +
        "</ul></div></div>");
    var valueNode = $("<pre/>", {
        css: {
            position: "absolute",
            left: "-99999px",
            "z-index": "-99999",
        }
    }).appendTo("body");
    $("#mw-panel a[data-wikitext]").on("click", function () {
        var self = $(this),
            selection = window.getSelection();
        var rangeCount = selection.rangeCount;
        var range;
        if (rangeCount > 0) {
            range = selection.getRangeAt(0);
        }
        valueNode.text(this.dataset.wikitext);
        selection.selectAllChildren(valueNode[0]);
        document.execCommand("copy");
        self.text("wikitext复制成功").data("last-time", new Date().getTime()).addClass("text-modified");
        window.setTimeout(function () {
            selection.removeAllRanges();
            if (rangeCount > 0) {
                selection.addRange(range);
            }
            valueNode.empty();
        }, 0);
        return false;
    });
    setInterval(function () {
        $("#mw-panel a[data-wikitext].text-modified").each(function () {
            var self = $(this);
            if (self.data("last-time") < new Date().getTime() - 3000) {
                self.text("复制对应wikitext").removeClass("text-modified");
            }
        });
    }, 1000);
    $(window).on("resize", function () {
        $mwPanel.height($body.height());
    });
});
