// <pre>
"use strict";
$(() => (async () => {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    try {
        if (!mw.config.get("wgUserGroups").includes("sysop")) { return; }
        if (mw.config.get("wgPageName") !== "Special:维护组最后活跃列表") { return; }
        $("#firstHeading").text("维护组最后活跃列表【（主、模板、分类、帮助、萌娘百科）名字空间下的指定时间范围编辑数统计】");
        document.title = "维护组最后活跃列表";
        const container = $("#mw-content-text");
        container.html('加载中（<span id="step">0</span> / 5）……');
        const step = $("#step");
        await mw.loader.using(["mediawiki.api", "ext.gadget.usergroup"]);
        mw.loader.using("jquery.tablesorter");
        const api = new mw.Api();
        const users = await (async () => {
            const result = {
                sysop: [],
                patroller: [],
                group: {},
            };
            const eol = Symbol();
            // sysop
            {
                let aufrom = undefined;
                while (aufrom !== eol) {
                    await sleep(100);
                    const _result = await api.post({
                        action: "query",
                        list: "allusers",
                        augroup: "sysop",
                        aulimit: "max",
                        auprop: "groups",
                        aufrom,
                    });
                    if (_result.continue) {
                        aufrom = _result.continue.aufrom;
                    } else {
                        aufrom = eol;
                    }
                    _result.query.allusers.forEach(({
                        name,
                        groups,
                    }) => {
                        if (groups.includes("bot")) {
                            return;
                        }
                        result.sysop.push(name);
                        result.group[name] = groups;
                    });
                }
                step.text("1");
            }
            // patroller
            {
                let aufrom = undefined;
                const _patroller = [];
                while (aufrom !== eol) {
                    await sleep(100);
                    const _result = await api.post({
                        action: "query",
                        list: "allusers",
                        augroup: "patroller",
                        aulimit: "max",
                        auprop: "groups",
                        aufrom,
                    });
                    if (_result.continue) {
                        aufrom = _result.continue.aufrom;
                    } else {
                        aufrom = eol;
                    }
                    _result.query.allusers.forEach(({
                        name,
                        groups,
                    }) => {
                        if (groups.includes("bot")) {
                            return;
                        }
                        _patroller.push(name);
                    });
                }
                step.text("2");
                while (_patroller.length > 0) {
                    const ususers = _patroller.splice(0, 500).join("|");
                    await sleep(100);
                    const _users = await api.post({
                        action: "query",
                        list: "users",
                        usprop: "groupmemberships",
                        ususers,
                    });
                    _users.query.users.forEach(({
                        name,
                        groupmemberships,
                    }) => {
                        const groups = groupmemberships.filter(({ expiry }) => expiry === "infinity").map(({ group }) => group);
                        if (groups.includes("bot") || !groups.includes("patroller")) {
                            return;
                        }
                        result.patroller.push(name);
                        result.group[name] = groups;
                    });
                }
                step.text("3");
            }
            return result;
        })();
        const defaultApiUrl = `${mw.config.get("wgServer")}${mw.config.get("wgScriptPath")}/api.php`;
        const apiUrls = ["zh.moegirl", "commons.moegirl", "en.moegirl", "ja.moegirl", "library.moegirl"].map((t) => defaultApiUrl.replace("zh.moegirl", t));
        const generateRequestData = (before, user) => ({
            action: "query",
            list: "usercontribs",
            format: "json",
            uclimit: "max",
            ucuser: user,
            ucnamespace: "0|10|14|12|4",
            ucprop: "timestamp",
            ucend: before.toISOString(),
        });
        const getContribs = async (userGroup, stepCount, month) => {
            const before = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * month);
            const _result = [];
            for (const user of users[userGroup]) {
                const apiResult = [];
                for (const url of apiUrls) {
                    await sleep(100);
                    apiResult.push(await (url.includes("zh.moegirl") ? api.post(generateRequestData(before, user)) : $.ajax({
                        url,
                        data: generateRequestData(before, user),
                        dataType: "jsonp",
                        type: "GET",
                    })));
                }
                _result.push([user, apiResult]);
            }
            const result = _result.map(([user, apiResult]) => ({ user, count: apiResult.map(({ query: { usercontribs: { length } } }) => length).reduce((accumulator, currentValue) => accumulator + currentValue), maybeOverCap: apiResult.filter((result) => "continue" in result).length > 0 }));
            step.text(stepCount);
            return result;
        };
        const usercontribs = {
            sysop: await getContribs("sysop", "4", 1),
            patroller: await getContribs("patroller", "5", 1),
        };
        container.css({
            display: "flex",
            "flex-wrap": "wrap",
            "justify-content": "center",
        }).empty();
        const render = (group, groupName, month, minimumCount) => {
            const root = $("<div/>");
            root.css({
                width: "100%",
                "max-width": "600px",
                margin: "1rem",
            });
            const table = $("<table/>");
            table.addClass("wikitable sortable");
            table.html(`<caption>${groupName}列表</caption><thead><th>用户名</th><th>近${month}个月来的编辑数</th></thead><tbody></tbody>`);
            const tbody = table.find("tbody");
            usercontribs[group].sort(({ count: a }, { count: b }) => a - b).forEach(({ user, count, maybeOverCap }) => {
                tbody.append(`<tr><td><a href="/User:${encodeURI(user)}" class="mw-userlink" title="User:${user}"><bdi>${user}</bdi></a><span class="mw-usertoollinks">（<a href="/User_talk:${encodeURI(user)}" class="mw-usertoollinks-talk" title="User talk:${user}">讨论</a> | <a href="/Special:%E7%94%A8%E6%88%B7%E8%B4%A1%E7%8C%AE/${encodeURI(user)}" class="mw-usertoollinks-contribs" title="Special:用户贡献/${user}">贡献</a> | <a href="/Special:%E5%B0%81%E7%A6%81/${user}" class="mw-usertoollinks-block" title="Special:封禁/${user}">封禁</a>）</span></td>${count === 0 ? "<td style=\"font-style: italic; color: red;\" data-sort-value=\"0\">无相关编辑</td>" : `<td style="color: ${count < minimumCount ? "red" : "black"};" data-sort-value="${count}">${count}${maybeOverCap ? "+次（实际编辑次数可能超出单次api请求上限）" : "次"}</td>`}`);
            });
            root.append(table);
            root.appendTo(container);
        };
        // sysop
        render("sysop", "管理员", 1, 3);
        // patroller
        render("patroller", "巡查姬", 1, 3);
        await mw.loader.using("jquery.tablesorter");
        container.find(".sortable").tablesorter();
        $(window).trigger("load");
    } catch (reason) {
        console.error(reason);
        if (reason instanceof Error) {
            $("#mw-content-text").css({
                border: "2px solid rgb(0, 0, 0)",
                margin: "14px 40px 10px",
                padding: "10px 15px",
                "background-color": "rgb(254, 237, 232)",
            }).html(`<p>工具发生错误：</p><dl><dt>错误类型：</dt><dd>${$("<span/>").text(reason.name).html()}</dd><dt>错误信息：</dt><dd><pre>${$("<span/>").text(`${reason.toString()}\n${reason.stack.split("\n").slice(1).join("\n")}`).html()}</pre></dd></dl>`);
        } else {
            $("#mw-content-text").css({
                border: "2px solid rgb(0, 0, 0)",
                margin: "14px 40px 10px",
                padding: "10px 15px",
                "background-color": "rgb(254, 237, 232)",
            }).html(`<p>工具发生错误：</p><pre>${$("<span/>").text(JSON.stringify(reason, undefined, 4)).html()}</pre>`);
        }
    }
})());
// </pre>
