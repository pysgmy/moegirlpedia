$(function () {
    var setTimeoutConstShow, setTimeoutConstHide, ajax;
    $(document).on('mouseover', 'a', function (e) {
        var that = this;
        if (/((Special|%E7%89%B9%E6%AE%8A):(Diff|%E5%B7%AE%E5%BC%82|%E5%B7%AE%E7%95%B0))|[?&]diff=/i.test(that.href) && (!/#/.test(that.href))) {
            clearTimeout(setTimeoutConstHide);
            clearTimeout(setTimeoutConstShow);
            setTimeoutConstShow = setTimeout(function () {
                if (!$('#quick-diff').length) {
                    $('body').append(
                        '<div id="quick-diff">'
                        + ' <div id="quick-diff-close" onClick="$(\'#quick-diff\').hide();">x</div>'
                        + ' <div id="quick-diff-arrow"></div>'
                        + ' <div id="quick-diff-content"></div>'
                        + '</div>');
                    $('head').append('<link rel="stylesheet" href="' + mw.config.get('wgLoadScript') + '?debug=false&modules=mediawiki.diff.styles&only=styles">');
                    $('head').append(
                        '<style type="text/css">'
                        + ' #quick-diff { border: 1px solid #a7d7f9; padding: 16px 24px 16px 24px; background-color: #ffffff; color: #222222; position: absolute; left: 20px; right: 20px; font-size: 14px; margin-bottom: 10px; display: none; z-index:20; }'
                        + ' #quick-diff-close { cursor: pointer; position: absolute; top: 0px; right: 0px; margin: -2px 7px; font-size: 20px; }'
                        + ' #quick-diff-content { max-height: 300px; overflow: auto; height: 100%; }'
                        + ' #quick-diff-arrow { position:absolute; height:0px; width:0px; border:6px solid transparent; }'
                        + '</style>'
                    );
                }
                if (e.clientY < document.body.clientHeight / 2) {
                    $('#quick-diff').css({
                        'top': $(that).offset().top + $(that).height() + 6,
                        'transform': ''
                    }).show();
                    $('#quick-diff-arrow').css({
                        'top': '-13px',
                        'bottom': '',
                        'border-top-color': 'transparent',
                        'border-bottom-color': '#a7d7f9',
                        'left': $(that).offset().left +  $(that).width() / 2 - 20 - 6
                    });
                } else {
                    $('#quick-diff').css({
                        'top': $(that).offset().top - 6,
                        'transform': 'translate(0, -100%)',
                    }).show();
                    $('#quick-diff-arrow').css({
                        'top': '',
                        'bottom': '-13px',
                        'border-top-color': '#a7d7f9',
                        'border-bottom-color': 'transparent',
                        'left': $(that).offset().left + $(that).width() / 2 - 20 - 6
                    });
                }
                $('#quick-diff-content').html('<div style="text-align: center;">Loading...</div>');
                var oldId = (that.href.match(/[?&]oldid=(\d*)/i) || ['', null])[1];
                if (!oldId) {
                    oldId = (that.href.match(/(?:Special|%E7%89%B9%E6%AE%8A):(?:Diff|%E5%B7%AE%E5%BC%82|%E5%B7%AE%E7%95%B0)\/(\d+)\/\d+/i) || [null, null])[1];
                }
                var newId = (that.href.match(/[?&]diff=([^&]*)/i) || [null, null])[1];
                if (!newId) {
                    newId = (that.href.match(/(?:Special|%E7%89%B9%E6%AE%8A):(?:Diff|%E5%B7%AE%E5%BC%82|%E5%B7%AE%E7%95%B0)\/\d+\/(\d+)/i) || [null, null])[1];
                    if (!newId) {
                        newId = (that.href.match(/(?:Special|%E7%89%B9%E6%AE%8A):(?:Diff|%E5%B7%AE%E5%BC%82|%E5%B7%AE%E7%95%B0)\/(\d+)/i) || [null, null])[1];
                    }
                }
                var ajaxData = {
                    action: 'compare',
                    format: 'json',
                    utf8: 1,
                }
                if (jQuery.isNumeric(oldId) && jQuery.isNumeric(newId)) {
                    if (newId == '0') {
                        ajaxData.torelative = 'cur';
                        ajaxData.fromrev = oldId;
                    } else {
                        ajaxData.fromrev = oldId;
                        ajaxData.torev = newId;
                    }
                } else {
                    if (oldId) {
                        ajaxData.torelative = newId;
                        ajaxData.fromrev = oldId;
                    } else {
                        ajaxData.torelative = 'prev';
                        ajaxData.fromrev = newId;
                    }
                }
                stopAjax();
                ajax = $.ajax({
                    type: "GET",
                    url: mw.config.get('wgScriptPath') + '/api.php',
                    data: ajaxData,
                    timeout: 15000,
                    success: function (data) {
                        if (data.compare && data.compare["*"] != null) {
                            $('#quick-diff-content').html('<table class="diff diff-contentalign-left" data-mw="interface"><colgroup>'
                                + '<col class="diff-marker"><col class="diff-content"><col class="diff-marker"><col class="diff-content"></colgroup><tbody>'
                                + (data.compare["*"] === '' ? '<div style="text-align: center;">（没有差异）</div>' : data.compare["*"])
                                + '</tbody></table>');
                            $.each(window.QuickDiffExtension || [], function (index, value, array) {
                                if (typeof value == "function") value($('#quick-diff')[0], data);
                            });
                        } else {
                            $('#quick-diff-content').html('<div>出现未知错误，以下是错误信息，请<a href="/User_talk:Nzh21">反馈给Nzh21</a></div>'
                                + JSON.stringify(data));
                        }
                        ajax = null;
                    },
                    error: function () {
                        $('#quick-diff-content').html('<div style="text-align: center; color: red; font-size: larger;">网络连接出错</div>');
                        ajax = null;
                    }
                })
            }, 300);
        }
    });
    $(document).on('mouseout', function () {
        clearTimeout(setTimeoutConstShow);
        clearTimeout(setTimeoutConstHide);
        setTimeoutConstHide = setTimeout(function () {
            stopAjax();
            $('#quick-diff').hide();
        }, 500);
    });
    $(document).on('mouseover', '#quick-diff', function () {
        clearTimeout(setTimeoutConstHide);
    });
    $(document).on('mouseout', '#quick-diff', function () {
        clearTimeout(setTimeoutConstHide);
        setTimeoutConstHide = setTimeout(function () {
            stopAjax();
            $('#quick-diff').hide();
        }, 500);
    });
    function stopAjax() {
        if (ajax) {
            ajax.abort();
            ajax = null;
        }
    }
});
