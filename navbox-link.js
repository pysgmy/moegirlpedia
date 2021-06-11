/**
   Author: ZUO Haocheng [[zhwiki:User:zuohaocheng]]
   Explanations for this javaScript code in http://zh.moegirl.org.cn/User:AnnAngela/js
*/
(function(mw) {
    var apiURIprefix = mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/api.php',
        pageName = encodeURIComponent(mediaWiki.config.get('wgPageName')),
        navboxLinksGet = function() {
            //获取本模版链接到的条目中是否包含了本模板
            var linksURI = apiURIprefix + '?action=query&format=xml&redirects=true&generator=links&gplnamespace=0&gpllimit=500&prop=templates&tllimit=500&tlnamespace=10&tltemplates=' + pageName + '&titles=' + pageName,
                fGetLink = function(result) {
                    var targetLoc, targetUl, targetLocFunc = function() { // 添加目标位置
                        var nla = $('<div></div>', {
                                id: 'not-listed-articles',
                            }),
                            nla_refresh = $('<a></a>', {
                                href: '#',
                                title: '强制刷新',
                                id: "nla-refresh",
                                text: "未添加本模版的条目"
                            }),
                            seperator = $('<div></div>').css({
                                height: '1px',
                                'margin-top': '0.5em',
                                'margin-bottom': '0.5em',
                                'background-color': '#aaa'
                            });
                        nla.append(nla_refresh).append(': ');
                        $('#catlinks').append(seperator).append(nla);
                        nla_refresh.click(function(event) {
                            event.preventDefault();
                            var d = new Date();
                            var requestid = d.getTime();
                            var rLinksURI = linksURI + '&requestid=' + requestid;
                            $.get(rLinksURI, function(result) {
                                seperator.remove();
                                nla.remove();
                                fGetLink(result);
                            });
                        });
                        return nla;
                    };
                    var redirects = {};
                    $(result).find('redirects r').each(function() {
                        var item = $(this);
                        redirects[item.attr('to')] = item.attr('from');
                    });
                    $(result).find("pages page").each(function() {
                        //判断已包含 && 红链
                        if ($(this).find("templates").length === 0 && typeof($(this).attr("missing")) === 'undefined') {
                            var pageTitle = $(this).attr('title');
                            if (typeof(targetLoc) === 'undefined') {
                                targetLoc = targetLocFunc();
                                targetUl = $('<ul></ul>');
                                targetLoc.append(targetUl);
                            }
                            var link = $('<a></a>', {
                                'title': pageTitle,
                                'text': pageTitle,
                                'href': mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/' + encodeURIComponent(pageTitle)
                            });
                            $('<li>').append(link).appendTo(targetUl);
                            var linksToChange = $('a[title="' + pageTitle + '"], a[title="' + redirects[pageTitle] + '"]');
                            link.mouseenter(function() {
                                linksToChange.css('background-color', 'yellow');
                            });
                            link.mouseleave(function() {
                                linksToChange.css('background-color', '');
                            });
                        }
                    });
                };
            $.get(linksURI, fGetLink);
            if ($('#not-listed-articles').length == -1) $('#catlinks').append('<div id="non-not-listed-article">本模板所有词条均添加了本模板</div>');
            else if ($('#not-listed-articles').prev().text()) $('#not-listed-articles').css({
                'border-top': '1px solid #E2E2E2',
                'padding-top': '3px',
                'margin-top': '3px'
            });
        };
    // 判断是否属于Template && 是否包含navbox
    if (mw.config.get('wgNamespaceNumber') === 10 && $("#mw-content-text .navbox:not(.template-documentation .navbox)").length !== 0) {
        navboxLinksGet();
    }
})(mediaWiki);
