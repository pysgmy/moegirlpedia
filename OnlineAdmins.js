/**
 * 取自[[zhwiki:MediaWiki:Gadget-OnlineAdmins.js]]，oldid=64572008。
 * 已萌百化。
 */
(function($, mw) {
    $(function() {
        // Create portlet link
        var portletLinkOnline = mw.util.addPortletLink(
                'p-cactions',
                '#',
                wgULS('在线维护组成员', '線上維護組人員'));
        var rcstart,
            rcend,
            time;
        var users = [];
        var sysops = [],
            patrollers = [];
        var api = new mw.Api();
        // Bind click handler
        $(portletLinkOnline).click(function(e) {
            e.preventDefault();
            users = [];
            var usersExt = [];
            sysops = [];
            patrollers = [];
            // 最近更改30分钟内的编辑用户
            time = new Date();
            rcstart = time.toISOString();
            time.setMinutes(time.getMinutes() - 30);
            rcend = time.toISOString();
            //API:RecentChanges
            api.get({
                format: 'json',
                action: 'query',
                list: 'recentchanges',
                rcprop: 'user',
                rcstart: rcstart,
                rcend: rcend,
                rcshow: '!bot|!anon',
                rclimit: 500
            }).done(function(data) {
                $.each(data.query.recentchanges, function(i, item) {
                    users[i] = item.user;
                });
                api.get({
                    format: 'json',
                    action: 'query',
                    list: 'logevents',
                    leprop: 'user',
                    lestart: rcstart,
                    leend: rcend,
                    lelimit: 500
                }).done(function(data) {
                    $.each(data.query.logevents, function(i, item) {
                        usersExt[i] = item.user;
                    });
                    Array.prototype.push.apply(users, usersExt);
                    // 使用者名稱去重與分割
                    users = $.unique(users.sort());
                    var promises = [];
                    var mark = function(data) {
                        $.each(data.query.users, function(i, user) {
                            // 找到管理员，去除bot
                            if ($.inArray('bot', user.groups) === -1) {
                                if ($.inArray('sysop', user.groups) > -1) {
                                    sysops[i] = user.name;
                                }
                                if ($.inArray('patroller', user.groups) > -1) {
                                    patrollers[i] = user.name;
                                }
                            }
                        });
                    };
                    for (var i = 0; i < (users.length + 50) / 50; i++) {
                        promises.push(api.get({
                                format: 'json',
                                action: 'query',
                                list: 'users',
                                ususers: users.slice(i * 50, (i + 1) * 50).join('|'),
                                usprop: 'groups'
                            }).done(mark));
                    }
                    // 查询用户权限
                    $.when.apply($, promises).done(function() {
                        // 消除空值
                        var filter = function(n) {
                            return n;
                        };
                        sysops = sysops.filter(filter);
                        patrollers = patrollers.filter(filter);
                        var userlink = function(user) {
                            var user2 = user.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&lt;');
                            return '<a href="/User:' + user2 + '" target="_blank">' + user2 + '</a>&nbsp;<small style="opacity:.75;">(<a href="/User talk:' + user2 + '" target="_blank">留言</a>)</small>　';
                        }
                        if (sysops.length + patrollers.length > 0) {
                            var adminsstring = [wgULS('<p>下面是最近30分钟之内在线的维护组成员</p>', '<p>下面是最近30分鐘內的線上維護組人員</p>')];
                            if (sysops.length > 0) {
                                adminsstring.push('<p style="word-break:break-all;">' + wgULS('管理员', '管理員') + ' (' + sysops.length + wgULS('个在线', '個在線') + ')：');
                                $.each(sysops, function(i, e) {
                                    adminsstring.push(userlink(e));
                                });
                                adminsstring.push('</p>');
                            }
                            if (patrollers.length > 0) {
                                adminsstring.push('<p style="word-break:break-all;">' + wgULS('巡查姬', '巡查姬') + ' (' + patrollers.length + wgULS('个在线', '個在線') + ')：');
                                $.each(patrollers, function(i, e) {
                                    adminsstring.push(userlink(e));
                                });
                                adminsstring.push('</p>');
                            }
                            mw.notify($(adminsstring.join('')));
                        } else {
                            mw.notify(wgULS('目前没有维护组成员在线。', '目前沒有維護組人員在線。'));
                        }
                    }).fail(function() {
                        mw.notify(wgULS('查询时发生错误，请稍后重试。', '查詢時發生錯誤，請稍後重試。'));
                    });
                });
            });
        });
    });
})(jQuery, mw);
