/* eslint-disable comma-dangle */
/* eslint-disable no-var */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable prefer-template */
// eslint-disable-next-line no-redeclare
/* global $, mw, LocalObjectStorage */
// <pre>
"use strict";
$(function () {
    if (location.hostname.startsWith("mzh")) {
        return;
    }
    if (![0, 1, 2, 3, 4, 5, 9, 11, 12, 13, 15, 275, 711, 829, 2301, 2303].includes(mw.config.get("wgNamespaceNumber"))) {
        return;
    }
    if ($("#mw-content-text .mw-headline").length <= 3) {
        return;
    }
    var verifyCache = function (_cache) {
        var cache = _cache;
        try {
            if (!$.isPlainObject(cache)) {
                cache = {};
            }
            var sameArticleId = {};
            Object.keys(cache).forEach(function (i) {
                if (!/^\d+-\d+/.test(i) || !Array.isArray(cache[i])) {
                    delete cache[i];
                }
                var articleIdAndCurRevisionId = i.match(/\d+/g);
                (sameArticleId[articleIdAndCurRevisionId[0]] = sameArticleId[articleIdAndCurRevisionId[0]] || []).push(articleIdAndCurRevisionId[1]);
            });
            Object.keys(sameArticleId).forEach(function (aid) {
                var c = sameArticleId[aid];
                if (c.length < 2) {
                    return;
                }
                c.sort(function (a, b) {
                    return +b - +a;
                });
                c.splice(0, 1);
                c.forEach(function (cid) {
                    delete cache[aid + "-" + cid];
                });
            });
        } catch (e) {
            console.info("AnnTools-float-toc", e);
            cache = {};
        }
        return cache;
    };
    var key = mw.config.get("wgArticleId") + "-" + mw.config.get("wgCurRevisionId");
    var localObjectStorage = new LocalObjectStorage("AnnTools-float-toc");
    var cache = verifyCache(localObjectStorage.getItem("cache"));
    try {
        if (typeof localStorage.getItem("AnnTools-float-toc") === "string") {
            var oldCache = JSON.parse(localStorage.getItem("AnnTools-float-toc"));
            if ($.isPlainObject(oldCache)) {
                $.extend(true, cache, oldCache);
            }
            localStorage.removeItem("AnnTools-float-toc");
            cache = verifyCache(cache);
        }
    } catch (e) {
        console.info("AnnTools-float-toc", e);
    }
    localObjectStorage.setItem("cache", cache);
    new Promise(function (res) {
        if (
            document.querySelector("#toc > ul > li")
            && !(
                document.body.classList.contains("widgetTalkTocEnable") ||
                document.getElementsByClassName("heading").length > 0 && document.getElementById("heading") ||
                document.getElementById("tocBox") ||
                document.getElementById("toc2TableSetting") ||
                document.querySelector(".toclimit-2, .toclimit-3, .toclimit-4, .toclimit-5, .toclimit-6, .toclimit-7")
            )
        ) {
            res({
                hasTurstTOC: true
            });
            return;
        }
        if (mw.config.get("wgArticleId") <= 0 || mw.config.get("wgCurRevisionId") <= 0 || /action=(?!view)|(?:direction|diffonly)=/i.test(location.search) || mw.config.get("wgCurRevisionId") !== mw.config.get("wgRevisionId")) {
            res({
                exit: true
            });
            return;
        }
        if (key in cache) {
            res({
                result: {
                    parse: {
                        sections: cache[key]
                    }
                }
            });
            return;
        }
        new mw.Api().post({
            action: "parse",
            format: "json",
            pageid: mw.config.get("wgArticleId"),
            prop: "sections"
        }).then(function (apiResult) {
            res({
                result: apiResult
            });
        });
    }).then(function (r) {
        var s = r.result;
        if (r.exit || !r.hasTurstTOC && (!s || !s.parse || !Array.isArray(s.parse.sections) || s.parse.sections.length === 0)) {
            return;
        }
        var root = $("<div/>");
        root.addClass("tocfloat").append('<div class="tocfloatlabel">显示目录</div>');
        var container = $("<div/>");
        container.attr("id", "NOTOC").addClass("tocfloatcontent mw-parser-output");
        $("body").append(root);
        root.append(container);
        container.prepend('<div class="toctitle" lang="zh-CN" dir="ltr"><h2>目录</h2></div>');
        if (r.hasTurstTOC) {
            container.append($("#toc > ul").clone().removeAttr("class style"));
            return;
        }
        var sections = s.parse.sections;
        var html = "",
            currentLevel = 0;
        var wgUserVariant = mw.config.get("wgUserVariant");
        var fallback = {
            "zh-cn": ["zh-hans"],
            "zh-tw": ["zh-hant"],
            "zh-hans": ["zh-cn"],
            "zh-hant": ["zh-tw"],
            zh: ["zh-hans", "zh-hant", "zh-cn", "zh-tw"]
        };
        var transcode = function transcode(_, i) {
            var transtable = {};
            var transmark = i.match(/[^|:;]+:[^;]+/g);
            for (var j = 0, l = transmark.length; j < l; j++) {
                transmark[j] = transmark[j].split(":");
                transtable[transmark[j][0]] = transmark[j][1];
            }
            if (transtable[wgUserVariant]) {
                return transtable[wgUserVariant];
            }
            var fallbacklist = fallback[wgUserVariant];
            for (var k = 0, len = fallbacklist.length; k < len; k++) {
                if (transtable[fallbacklist[k]]) {
                    return transtable[fallbacklist[k]];
                }
            }
            return "在手动语言转换规则中检测到错误"; // 此时转换插件会显示『在手动语言转换规则中检测到错误』
        };
        var sanity = $(document.createElement("span"));
        var sanityClean = function sanityClean(h) {
            sanity.html(h);
            sanity.find("script, style, link, iframe, frame, object, param, audio, video, base, head, meta, title, body, h1, h2, h3, h4, h5, h6, blockquote, dd, dl, dir, dt, hr, li, ul, ol, pre, abbr, br, cite, data, tt, var, wbr, area, map, track, applet, embed, noembed, picture, source, canvas, noscript, caption, col, colgroup, table, tbody, thead, tfoot, td, th, tr, button, datalist, fieldset, form, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, shadow, element, content, slot, template, bgsound, blink, center, command, frameset").remove();
            return sanity.html().replace(/-{([^|:;]*?)}-/g, "$1").replace(/-{(?:A\|)?([^|]+?:[^|]+?)}-/g, transcode);
        };
        var temp = document.createElement("div");
        sections.forEach(function (_a) {
            var anchor = _a.anchor,
                index = _a.index,
                line = _a.line,
                number = _a.number,
                toclevel = _a.toclevel;
            if (toclevel > currentLevel) {
                while (toclevel > currentLevel) {
                    currentLevel++;
                    html += "<ul>";
                }
            } else if (toclevel < currentLevel) {
                while (toclevel < currentLevel) {
                    currentLevel--;
                    html += "</ul></li>";
                }
                html += "</li>";
            } else {
                html += "</li>";
            }
            var a = document.createElement("a");
            a.href = "#";
            a.href += anchor;
            a.innerHTML = "<span class=\"tocnumber\">" + number + "</span> ";
            var toctext = document.createElement("span");
            toctext.innerHTML = sanityClean(line);
            a.appendChild(toctext);
            temp.innerHTML = "";
            temp.appendChild(a);
            html += "<li class=\"toclevel-" + toclevel + " tocsection-" + index + "\">" + a.outerHTML;
        });
        container.append(html + "</li></ul>");
        cache[key] = s.parse.sections;
        localObjectStorage.setItem("cache", verifyCache(cache));
    });
});
// </pre>
