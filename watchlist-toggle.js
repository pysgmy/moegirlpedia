(function(mw) {
    mw.loader.implement('AnnToolsWatchlistToggle', function($, jQuery) {
        if (!$('.mw-special-Watchlist')[0]) return false;
        var ClickToHide, ClickToHideButton;
        if ($('.mw-enhanced-rc')[0]) $('.mw-changeslist > div > .mw-enhanced-rc').each(function() {
            if ($(this).find('.mw-title a').first().text().indexOf('alk:') == -1) $(this).addClass('mw-changeslist-non-talk-page');
        });
        else $('.mw-changeslist > ul > li').each(function() {
            if ($(this).find('.mw-title a').text().indexOf('alk:') == -1) $(this).addClass('mw-changeslist-non-talk-page');
        });
        if (mw.config.get('wgUserLanguage').indexOf('zh') != -1) ClickToHide = "点此隐藏/显示非讨论页更改：", ClickToHideButton = ['隐藏', '显示'];
        else ClickToHide = "Click this button to hide/show the non-talk page's change:", ClickToHideButton = ['Hide', 'Show'];
        ClickToHide += '<input id="ToggleNonTalkPageChange">';
        $('#mw-watchlist-options').append('<p>' + ClickToHide + '</p>');
        $('#ToggleNonTalkPageChange').attr('type', 'button').css('margin', '0 0.5em').val(ClickToHideButton[0]).on('click', function() {
            if (!$('.mw-changeslist-non-talk-page').not(':hidden')[0]) {
                $('.mw-changeslist-non-talk-page').fadeIn();
                $(this).val(ClickToHideButton[0]);
            } else {
                $('.mw-changeslist-non-talk-page').fadeOut();
                $(this).val(ClickToHideButton[1]);
            }
        });
        if (!$('.mw-changeslist:last .mw-changeslist-line-watched')[0]) return;
        $('#mw-watchlist-options').append('<p>点此隐藏/显示已访问页面：<input id="ToggleWatchedPageChange"></p>');
        $("#ToggleWatchedPageChange").attr('type', 'button').css('margin', '0 0.5em').val('隐藏').on('click', function() {
            if ($('.mw-changeslist:last .mw-changeslist-line-not-watched').first().is(':hidden')) {
                $('.mw-changeslist:last .mw-changeslist-line-not-watched').fadeIn();
                $(this).val('隐藏');
            } else {
                $('.mw-changeslist:last .mw-changeslist-line-not-watched').fadeOut();
                $(this).val('显示');
            }
        });
    });
})(mediaWiki);
