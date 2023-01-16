/*
UserStatus.js
by User:AnnAngela
Modified by User:一位史蒂夫
 
Original script: https://zh.moegirl.org.cn/User:AnnAngela/js/userStatus.js
*/
/* eslint-disable require-atomic-updates */
// <pre>
"use strict";
$(() => (async () => {
    if (location.hostname.startsWith("mzh.")) {
        return;
    }
    await mw.loader.using(["ext.gadget.LocalObjectStorage"]);
    const localObjectStorage = new LocalObjectStorage("UserStatus");
    try {
        const builtinStatus = {
            online: '<span style="height:1em;width:1em;background-color:green;border-radius:50%;display:inline-block;"></span><b style="color:green;">在线</b>',
            busy: '<span style="height:1em;width:1em;background-color:steelblue;border-radius:50%;display:inline-block;"></span><b style="color:steelblue;">忙碌</b>',
            offline: '<span style="height:1em;width:1em;background-color:red;border-radius:50%;display:inline-block;"></span><b style="color:red;">离线</b>',
            away: '<span style="height:1em;width:1em;background-color:mediumaquamarine;border-radius:50%;display:inline-block;"></span><b style="color:mediumaquamarine;">已离开</b>',
            sleeping: '<span style="height:1em;width:1em;background-color:lightsteelblue;border-radius:50%;display:inline-block;"></span><b style="color:lightsteelblue;">在睡觉</b>',
            wikibreak: '<span style="height:1em;width:1em;background-color:brown;border-radius:50%;display:inline-block;"></span><b style="color:brown;">正在放萌百假期</b>',
            holiday: '<span style="height:1em;width:1em;background-color:cadetblue;border-radius:50%;display:inline-block;"></span><b style="color:cadetblue;">处于假期中</b>',
            died: '<span style="height:1em;width:1em;background-color:black;border-radius:50%;display:inline-block;"></span><b style="color:black;">已去世</b>',
            studying: '<span style="height:1em;width:1em;background-color:gold;border-radius:50%;display:inline-block;"></span><b style="color:gold;">在学习</b>',
            left: '<span style="height:1em;width:1em;background-color:grey;border-radius:50%;display:inline-block;"></span><b style="color:grey;">暂时退站</b>',
            exam: '<span style="height:1em;width:1em;background-color:paleturquoise;border-radius:50%;display:inline-block;"></span><b style="color:paleturquoise;">正在备考</b>',
            noupdate: '<span style="height:1em;width:1em;background-color:seagreen;border-radius:50%;display:inline-block;"></span><b style="color:seagreen;">已停更</b>',
            lazy: '<span style="height:1em;width:1em;background-color:salmon;border-radius:50%;display:inline-block;"></span><b style="color:salmon;">咕咕咕</b>',
            onbutbusy: '<span style="height:1em;width:1em;background-color:teal;border-radius:50%;display:inline-block;"></span><b style="color:teal;">正在进行大工程</b>',
            dorm: '<span style="height:1em;width:1em;background-color:darkgrey;border-radius:50%;display:inline-block;"></span><b style="color:darkgrey;">已开学</b>',
            _unknown: '<span style="height:1em;width:1em;background-color:gray;border-radius:50%;display:inline-block;"></span><i style="color:gray;">状态不详</i>',
        };
        const originalBuiltinStatusIndex = Object.keys(builtinStatus);
        mw.loader.addStyleTag("#pt-userstatus { margin-top: 1em !important; margin-bottom: 0px !important; } .pt-userstatus-img { width: 25px; margin-top: -0.25em; }");
        builtinStatus.on = builtinStatus.online;
        builtinStatus.off = builtinStatus.offline;
        builtinStatus.break = builtinStatus.wikibreak;
        builtinStatus.sleep = builtinStatus.sleeping;
        const userName = mw.config.get("wgUserName");
        if (userName === null) {
            return;
        }
        const statusPage = `User:${userName}/Status`;
        const now = new Date().getTime();
        let rawStatus;
        try {
            const localStatus = await localObjectStorage.getItem("localStatus");
            if (mw.config.get("wgPageName") !== statusPage
                && typeof localStatus.timestamp === "number" && localStatus.timestamp > now - 10 * 60 * 1000
                && localStatus.status in builtinStatus) {
                rawStatus = localStatus.status;
            } else {
                throw new Error();
            }
        } catch {
            try {
                rawStatus = (await $.ajax({
                    url: `${mw.config.get("wgServer")}${mw.config.get("wgScriptPath")}/index.php`,
                    type: "GET",
                    data: {
                        title: statusPage,
                        action: "raw",
                    },
                    cache: false,
                })).trim();
                if (rawStatus in builtinStatus) {
                    await localObjectStorage.setItem("localStatus", {
                        timestamp: now,
                        status: rawStatus,
                    });
                }
            } catch {
                rawStatus = "_unknown";
                await localObjectStorage.removeItem("localStatus");
            }
        }
        const currentStatus = rawStatus in builtinStatus ? builtinStatus[rawStatus] : (() => {
            const div = $("<div/>").html(rawStatus);
            div.find("script, style, link, iframe, frame, object, param, audio, video, base, head, meta, title, body, h1, h2, h3, h4, h5, h6, blockquote, dd, dl, dir, dt, hr, li, ul, ol, pre, a, abbr, br, cite, code, data, em, rb, rp, rt, rtc, ruby, samp, time, tt, var, wbr, area, map, track, applet, embed, noembed, picture, source, canvas, noscript, caption, col, colgroup, table, tbody, thead, tfoot, td, th, tr, button, datalist, fieldset, form, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, shadow, element, content, slot, template, bgsound, blink, center, command, frameset").remove();
            div.find("img").attr("class", "pt-userstatus-img");
            return div.html();
        })();
        const pt = $("<li id=\"pt-userstatus\"><a id=\"pt-userpage-link\" href=\"javascript:void(0);\" dir=\"auto\" style=\"display:inline-flex;align-items:center;\" title=\"您的状态\"></a></li>");
        pt.find("#pt-userpage-link").html(currentStatus).on("click", async () => {
            await mw.loader.using(["oojs-ui", "mw.Api"]);
            const messageDialog = new OO.ui.MessageDialog();
            const windowManager = new OO.ui.WindowManager();
            $("body").append(windowManager.$element);
            windowManager.addWindows([messageDialog]);
            messageDialog.title.$label.html("修改自己的状态");
            const container = $("<div/>");
            container.append(`<p>修改<a href="${mw.config.get("wgServer")}${mw.config.get("wgScriptPath")}/${statusPage}">自己的状态</a>为：</p>`);
            const builtinStatusList = originalBuiltinStatusIndex.map((data, i) => data === "_unknown" ? undefined : { data, label: `${i}`, html: builtinStatus[data] }).filter(n => !!n);
            const builtinStatusSelector = new OO.ui.RadioSelectInputWidget({
                value: rawStatus,
                options: builtinStatusList.map(({ data, label }) => ({ data, label })),
            });
            builtinStatusSelector.$element.find(".oo-ui-radioSelectWidget > .oo-ui-radioOptionWidget > .oo-ui-labelElement-label").each((_, labelEle) => {
                $(labelEle).css({"overflow":"visible","display":"inline-flex","align-items":"center"}).html((builtinStatusList.filter(({ label }) => $(labelEle).text() === label)[0] || { html: $(labelEle).html() }).html);
            });
            container.append(builtinStatusSelector.$element);
            container.append(`<p>本工具在获取状态信息后有10分钟的缓存，您可以通过直接打开<a href="${mw.config.get("wgServer")}${mw.config.get("wgScriptPath")}/${statusPage}">自己的状态页</a>来强制获取最新状态信息。`);
            messageDialog.message.$label.append(container);
            const action = new OO.ui.ActionWidget({
                action: "confirm",
                label: "提交",
                flags: "primary",
            });
            const cAction = new OO.ui.ActionWidget({
                action: "cancel",
                label: "取消",
                flags: "primary",
            });
            cAction.$element[0].addEventListener("click", () => {
                windowManager.closeWindow(messageDialog);
            }, {
                capture: true,
            });
            action.$element[0].addEventListener("click", async () => {
                windowManager.closeWindow(messageDialog);
                const fMessageDialog = new OO.ui.MessageDialog();
                windowManager.addWindows([fMessageDialog]);
                const cAction = new OO.ui.ActionWidget({
                    action: "accept",
                    label: "我知道了",
                    flags: "primary",
                });
                cAction.$element[0].addEventListener("click", () => {
                    windowManager.closeWindow(fMessageDialog);
                }, {
                    capture: true,
                });
                try {
                    const status = builtinStatusSelector.getValue();
                    await new mw.Api().postWithToken("csrf", {
                        action: "edit",
                        title: statusPage,
                        text: status,
                        summary: `修改状态为 - ${status}`,
                        tags: "Automation tool",
                        minor: true,
                    });
                    await localObjectStorage.setItem("localStatus", {
                        timestamp: new Date().getTime(),
                        status: status,
                    });
                    pt.find("#pt-userpage-link").html(builtinStatus[status]);
                    rawStatus = status;
                    fMessageDialog.title.$label.html("状态修改完成！");
                    fMessageDialog.message.$label.html(`<p>你的状态已修改为：${builtinStatus[status]}</p>`);
                    const action = new OO.ui.ActionWidget({
                        action: "confirm",
                        label: "确定",
                        flags: "primary",
                    });
                    action.$element[0].addEventListener("click", () => {
                        windowManager.closeWindow(fMessageDialog);
                    }, {
                        capture: true,
                    });
                    windowManager.openWindow(fMessageDialog, {
                        actions: [action],
                    });
                } catch (e) {
                    fMessageDialog.title.$label.html("状态修改发生错误……");
                    fMessageDialog.message.$label.html(`错误信息为：${e}`);
                    windowManager.openWindow(fMessageDialog, {
                        actions: [cAction],
                    });
                }
            }, {
                capture: true,
            });
            windowManager.openWindow(messageDialog, {
                actions: [action, cAction],
            });
            return false;
        });
        $("#pt-userpage").after(pt);
        mw.loader.using(["oojs-ui", "mw.Api"]);
    } catch (reason) {
        console.error(reason);
        const lastError = sessionStorage.getItem("AnnTools-userstatus-img-Error");
        if (lastError !== reason.toString()) {
            alert(`显示用户状态工具发生错误：\n${reason}`);
            sessionStorage.setItem("AnnTools-userstatus-img-Error", reason);
        }
    }
})());
// </pre>
