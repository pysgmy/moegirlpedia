(function($, mw) {
    if (mw.config.get('wgPageName').match(/\.js$/)) $('.mw-code').addClass('prettyprint linenums lang-js');
    if (mw.config.get('wgPageName').match(/\.css$/)) $('.mw-code').addClass('prettyprint linenums lang-css');
    var acceptsLangs = {
        "js": "js",
        "javascript": "js",
        "css": "css",
        "html": "html",
        "scribunto": "lua",
        "lua": "lua"
    };
    var wgPageContentModel = mw.config.get("wgPageContentModel", "").toLowerCase();
    if (wgPageContentModel in acceptsLangs) {
        $('.mw-code').addClass('prettyprint linenums lang-' + acceptsLangs[wgPageContentModel]);
    }
    $('pre[lang]').each(function() {
        var self = $(this);
        var lang = self.attr("lang").toLowerCase();
        if (lang in acceptsLangs) {
            self.addClass("prettyprint linenums lang-" + acceptsLangs[lang]);
        }
    });
    if ($('.prettyprint').length > 0) {
        $.ajax({
            url: mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/index.php?title=MediaWiki:Gadget-code-prettify-core.js&action=raw&ctype=text/javascript',
            dataType: 'script',
            cache: true,
            success: function() {
                prettyPrint();
                if (mw.config.get('wgPageName').match(/\.(js|css)$/)) {
                    $(window).on("hashchange", function() {
                        var frag = new mw.Uri().fragment;
                        if (/^L\d+$/.test(frag)) {
                            var firstCode = $("#" + frag)[0] || $(".prettyprint.prettyprinted > .linenums").first().children().eq(+frag.substring(1) - 1)[0];
                            if (firstCode) {
                                $('html, body').animate({
                                    scrollTop: $(firstCode).offset().top,
                                });
                            }
                        }
                    }).trigger("hashchange");
                }
            }
        });
    }
})(jQuery, mediaWiki);
