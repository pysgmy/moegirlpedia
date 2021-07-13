/* global mediaWiki */
//<pre> mw傻逼，不写<pre/>三个以上波浪号全都要替换，傻得要死
(function(mw) {
    if (!String.prototype.includes) String.prototype.includes = function includes(search, start) {
        'use strict';
        if (typeof start !== 'number') start = 0;
        if (start + search.length > this.length) return false;
        return this.indexOf(search, start) !== -1;
    };
    mw.loader.implement('AnnToolsSendWelcomeMessage', function() {
        var message = '<div style="position: relative; width: 700px; max-width: 90%; margin-top: .5em; padding: 10px; border: solid medium #add8e6; -moz-border-radius: 15px; -webkit-border-radius: 15px; border-radius: 15px; font-size: 110%">
<div style="position: relative; z-index:2;">
'''您好，亲爱的展开模板！欢迎加入萌娘百科！'''

[[萌娘百科]]是以'''收录萌化角色和流行事物'''为特色，开放的ACG百科全书——
*我们坚持“[[万物皆可萌]]”的观点，从ACGN角度进行客观描述；
*您可以从 '''[[Help:Wiki入门|入门]]''' 和 '''[[Help:萌娘百科编辑的快速养成方法-从入门到精通|编辑教程]]''' 开始学习编辑萌娘百科；
*萌娘百科有最低限度的 [[萌娘百科:编辑规范|编辑规范]] 要求；
*您可以在 '''[[Help:沙盒|沙盒（公共测试区）]]''' 以及 '''[[Special:MyPage/Sandbox|您的个人测试区]]''' 进行任意测试；
*萌娘百科内容禁止商业使用，文字内容按照 [[萌娘百科:版权信息|cc by-nc-sa协议]] 发布，其他形式作品版权归属原作者；
*此外，我们'''不墨守成规'''，请放心大胆的编辑~☆

<div style="text-align: right;">一位史蒂夫 敬上</div>
</div>
</div>
<p class="plainlinks">'''提示'''：你可以通过本页右上方工具栏的[[https://zh.moegirl.org.cn/index.php?title=Special:%E5%B1%95%E5%BC%80%E6%A8%A1%E6%9D%BF&action=edit 编辑]]来个性定制你的讨论页；通过右上角的<nowiki>[</nowiki>[[特殊:参数设置|参数设置(我的偏好设定)]]<nowiki>]</nowiki>来修改你的个人设置；点击您的头像来<nowiki>[</nowiki>[[Special:上传头像|上传新头像]]<nowiki>]</nowiki>。</p><div style="clear:both;"></div>——~~~~',
            errorFun = function errorFun(_, self) {
                unbindFun();
                self.addClass('unsend');
                return false;
            },
            unbindFun = function unbindFun() {
                if ($('#welcomeClear').length > 0) $('#welcomeClear').remove();
                $('#welcomeAsk').append('<span id="welcomeClear">返回</span>');
                $('#welcomeClear').on('click.welcome', function() {
                    $('#welcomeAsk').remove();
                });
            };
        if (mw.config.get('wgNamespaceIds').user_talk == mw.config.get('wgNamespaceNumber') && !mw.config.get('wgPageName').includes('/') && mw.config.get('wgEditMessage') == 'creating' && $('#wpTextbox1')[0] && !$('#wpTextbox1').val()) $('#wpTextbox1').val(message);
 
        function check(that, onClick) {
            if (!$(that).is('#mw-content-text a.new')) return;
            if (!/(?=title\=user\_talk\:)[^\&]+/i.test(that.href)) return;
            var self = $(that),
                href = self.attr('href'),
                userName = decodeURIComponent(href.match(/(?=user\_talk\:)[^\&]+/i)[0].replace(/user_talk\:/i, ''));
            if (href.includes('User_talk') && href.includes('redlink=1') && href.includes('action=edit') && !userName.includes('/')) {
                self.addClass('sendWelcomeMessageLink unsend nopopus').on('click.sendWelcomeMessage', function() {
                    if ($('#welcomeAskFinished')[0]) $('#welcomeClear').click();
                    if ($('#welcomeAsk')[0]) {
                        self.after('<span class="welcomeAsk">一次只能发送一份欢迎辞哦，不要太贪心了~<span id="welcomeClear2">返回</span></span>');
                        $('#welcomeClear2').on('click.welcome', function() {
                            $(this).parent().remove();
                        });
                        return false;
                    }
                    if (/[&\/]+/.test(userName)) {
                        window.open(href, '_blank');
                        return errorFun('地址解析出错！\n原地址：' + href + '，解析用户讨论页标题结果：User talk:' + userName, self);
                    }
                    self.removeClass('unsend').after('<span id="welcomeAsk">你想直接发送欢迎辞还是访问该未创建页面？<span id="welcomeYes">发送欢迎辞</span> · <span id="welcomeNo">访问该页面</span> · <span id="welcomeClear">返回</span></span>');
                    $('#welcomeNo').on('click.welcome', function() {
                        window.open(href, '_blank');
                    });
                    $('#welcomeClear').on('click.welcome', function() {
                        $('#welcomeAsk').remove();
                    });
                    $('#welcomeYes').on('click.welcome', function() {
                        var api = new mw.Api();
                        $('#welcomeAsk').empty().append('正在通信中……');
                        api.postWithToken('csrf', {
                            'action': 'edit',
                            'format': 'json',
                            'title': 'User talk:' + userName,
                            'summary': 'Welcome to MoegirlPedia',
                            'text': message,
                            'tags': 'Welcome to MoegirlPedia',
                            'createonly': true
                        }).then(function(data) {
                            $('#welcomeAsk').empty().append('<span id="welcomeAskFinished">通信成功！继续努力哦~</span>');
                            console.debug('和萌百服务器通信成功，编辑成功！ \n编辑详情：' + JSON.stringify(data).replace(/[{}\"]/g, '').replace(/\:\,/, ',') + '。');
                            unbindFun();
                            $('#mw-content-text a.new[href="' + href + '"]').removeClass('new sendWelcomeMessageLink unsend').attr('href', '/User_talk:' + userName).off('click.sendWelcomeMessage'); //js<a>对象的href是绝对url……
                        }, function(f, s) {
                            /*
                             * 第一个参数是错误代码，如果是连接错误值为http，如果是后端错误值为articleexists等；
                             * 第二个参数是错误信息对象，如果是连接错误值为{ xhr: JQueryXHR, exception: String, textStatus: String }，如果是后端错误值为后端返回的内容；
                             * 如果是后端错误，第三个参数与第二个参数目视一致；
                             * 如果是后端错误，第四个参数则是jQueryXHR。
                             */
                            console.debug('sendWelcomeMessage');
                            console.debug.apply(console, arguments);
                            if (f === 'internal_api_error_Exception') {
                                $('#welcomeAsk').empty().append('<span id="welcomeAskFinished">通信成功！继续努力哦~</span>');
                                console.debug('和萌百服务器通信成功，编辑成功！ \n萌百服务器返回"internal_api_error_Exception"，你们都懂的_(：3 」∠ )_ 。');
                                unbindFun();
                                $('#mw-content-text a.new[href="' + href + '"]').removeClass('new sendWelcomeMessageLink unsend').attr('href', '/User_talk:' + userName).off('click.sendWelcomeMessage'); //js<a>对象的href是绝对url……
                            } else if (f === 'articleexists') {
                                $('#welcomeAsk').empty().append('<span id="welcomeAskFinished">通信成功！该讨论页已经存在，请注意哦~</span>');
                                errorFun('和萌百服务器通信成功，但编辑失败！\n编辑详情：' + JSON.stringify(s).replace(/[{}\"]/g, '').replace(/\:\,/g, ','), self);
                                unbindFun();
                                $('#mw-content-text a.new[href="' + href + '"]').removeClass('new sendWelcomeMessageLink unsend').attr('href', '/User_talk:' + userName).off('click.sendWelcomeMessage'); //js<a>对象的href是绝对url……
                            } else {
                                var reason = '';
                                var object = s.error || s;
                                for (var i in object) {
                                    if (['*', 'xhr'].indexOf(i) !== -1) {
                                        if (reason) reason += ', ';
                                        reason += i + ': ' + JSON.stringify(object[i]).replace(/[{}\"]/g, '').replace(/\:\,/g, ',');
                                    }
                                }
                                if (typeof f === 'string') reason = f + '（' + reason + '. ）';
                                else reason += '. ';
                                $('#welcomeAsk').empty().append('<span id="welcomeAskFinished">正在通信中……失败！请重试！【 ' + reason + '】</span>');
                                errorFun('和萌百服务器通信成功，但编辑失败！\n编辑详情：' + JSON.stringify(s).replace(/[{}\"]/g, '').replace(/\:\,/g, ','), self);
                                unbindFun();
                                self.addClass('unsend');
                            }
                        });
                    });
                    return false;
                });
                if (onClick) self.trigger('click.sendWelcomeMessage');
                return false;
            }
        }
        $(document.body).on('click', function(event) {
            check(event.target, true);
        });
        $('#mw-content-text a.new').each(function() {
            check(this);
        });
        $("<style>#welcomeAsk,.welcomeAsk{border:#bbeeff 1px solid;margin:0 3px 0 7px} #welcomeYes,#welcomeNo,#welcomeClear,#welcomeClear2{cursor:pointer;color:purple}.sendWelcomeMessageLink.unsend:after{content:'S';color:purple;line-height:1;vertical-align:super;font-size:smaller}.sendWelcomeMessageLink{text-decoration:none!important}</style>").appendTo("head");
    });
})(mediaWiki);
//</pre>
