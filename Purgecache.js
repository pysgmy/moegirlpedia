// <pre>
$(function() {
    var li = $('<li/>').appendTo("#p-personal > ul"),
        textNode = $('<span/>'),
        containerNode;
    if (mw.config.get('wgNamespaceNumber') === -1) {
        containerNode = $('<span/>');
        containerNode.css({
            'cursor': 'default',
            'user-select': 'none'
        });
        containerNode.append('特殊页面（').append(textNode).append('）');
    } else {
        containerNode = $('<a/>');
        var statusNode = $('<span/>').text('清除页面缓存'),
            runningStatus = false;
        containerNode.attr("href", 'javascript:void(0);');
        containerNode.append(statusNode).append('（').append(textNode).append('）');
        containerNode.on('click', function() {
            if (runningStatus) return;
            statusNode.text('正在清除页面缓存……');
            statusNode.prepend('<img src="https://img.moegirl.org.cn/common/d/d1/Windows_10_loading.gif" style="height: 1em; margin-top: -.25em;">');
            runningStatus = true;
            var api = new mw.Api(),
                opt = {
                    action: 'purge',
                    format: 'json',
                    forcelinkupdate: true,
                    titles: mw.config.get('wgPageName')
                };
            api.post(opt).then(function() {
                setTimeout(function() {
                    api.post(opt).then(function() {
                        statusNode.text('清除页面缓存成功！');
                        setTimeout(location.reload.bind(location), 1000);
                    }, function() {
                        statusNode.text('清除页面缓存失败，点击可重试！');
                        runningStatus = false;
                        setTimeout(function() {
                            if (!runningStatus) statusNode.text('清除页面缓存');
                        }, 5000);
                    });
                }, 370);
            }, function() {
                statusNode.text('清除页面缓存失败，点击可重试！');
                runningStatus = false;
                setTimeout(function() {
                    if (!runningStatus) statusNode.text('清除页面缓存');
                }, 5000);
            });
        });
    }
    li.append(containerNode);
    textNode.text(moment().format('A h[:]mm[:]ss'));
    var date = new Date();
    var now = date.getTime();
    date.setMilliseconds(0);
    date.setSeconds(date.getSeconds() + 1);
    setTimeout(function() {
        setInterval(function() {
            textNode.text(moment().format('A h[:]mm[:]ss'));
        }, 1e3);
        textNode.text(moment().format('A h[:]mm[:]ss'));
    }, date.getTime() - now);
    new Image().src = "https://img.moegirl.org.cn/common/d/d1/Windows_10_loading.gif";
});
// </pre>
