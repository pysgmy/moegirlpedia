// 巡查用小工具，对于主、模板、分类空间的页面，在右上角【更多】中添加【页面名简体化】。修改自[[User:C8H17OH/moveToUserSubpage.js]]。
// 使用方法：在[[Special:我的用户页/common.js]]中添加一行：mw.loader.load('https://zh.moegirl.org.cn/index.php?title=User:C8H17OH/simplifyPageName.js&action=raw&ctype=text/javascript');

$(function() {
    var self = $('#p-cactions .menu ul');
    if (!self.find('li')[0]
    	|| $('.willBeDeleted')[0]
    	|| mw.config.get('wgUserGroups').indexOf('patroller') === -1
    	|| (mw.config.get('wgNamespaceNumber') !== 0 // main
    		&& mw.config.get('wgNamespaceNumber') != 10 // Template
    		&& mw.config.get('wgNamespaceNumber') != 14 // Category
    		&& mw.config.get('wgNamespaceNumber') != 2 // User
    	)) return;
    $('<a/>', {
        attr: {
            href: "#",
            title: "移动到简体页面名并挂删重定向"
        },
        text: '页面名简体化'
    }).on('click', function() {
        var api = new mw.Api(),
            loadingBox = $('<div/>', {
                css: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    height: '100vh',
                    width: '100vw',
                    transition: 'opacity .73s linear',
                    color: 'black',
                    'padding-top': '49vh',
                    'background-color': 'rgba(255,255,255,0.73)',
                    'text-align': 'center'
                }
            }).append('<img src="https://static.mengniang.org/common/d/d1/Windows_10_loading.gif" style="height: 1em; margin-top: -.25em;">正在移动中……'),
            reason;
        loadingBox.endOut = function endOut() {
            this.css('color', 'red').text('移动失败……').delay(1000).queue(function() {
                $(this).css('opacity', '0').delay(730).queue(function() {
                    $(this).remove();
                    $(document.body).css('overflow', 'auto');
                    $(this).dequeue();
                });
                $(this).dequeue();
            });
        };
        reason = '移动到简体页面名';
        $(document.body).append(loadingBox).css('overflow', 'hidden');
        
        api.postWithToken('csrf', {
        	action: 'parse',
        	format: 'json',
        	title: mw.config.get('wgPageName'),
        	disablelimitreport: true
        }).then(function(d) {
            // console.log("parse done");
            if (d.error) return loadingBox.endOut();
            dest = d.parse.displaytitle;
            if (confirm('页面将被移动到[[' + dest + ']]，确认如此？') === false) return;
            return api.postWithToken('csrf', {
	            action: 'move',
	            format: 'json',
	            from: mw.config.get('wgPageName'),
	            to: dest,
	            movetalk: true,
	            movesubpages: true,
	            reason: reason,
	            watchlist: 'preferences'
	        });
	    }, loadingBox.endOut.bind(loadingBox)).then(function(d) {
            // console.log("move done");
            if (d.error) return loadingBox.endOut();
            var reasonText = reason ? '|' + reason : '';
            return api.postWithToken('csrf', {
                action: 'edit',
                format: 'json',
                title: mw.config.get('wgPageName'),
                text: '<noinclude>{{即将删除' + reasonText + '|user=' + mw.config.get("wgUserName") + '}}</noinclude>',
                summary: '挂删：' + reason,
                nocreate: true,
                watchlist: 'preferences'
            });
        }, loadingBox.endOut.bind(loadingBox)).then(function(d) {
        	// console.log("register_to_delete done");
            if (d.error) return loadingBox.endOut();
            loadingBox.css('color', 'green').text('移动成功！即将刷新……');
            window.setTimeout(function() {
                window.location.reload();
            }, 730);
        }, loadingBox.endOut.bind(loadingBox));
    }).appendTo($('<li/>', {
        attr: {
            id: 'ca-simplifyPageName'
        }
    }).prependTo(self));
});
