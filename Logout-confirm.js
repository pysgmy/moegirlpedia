"use strict";
(function() {
    $("#pt-logout > a[href*=logoutToken]").each(function(_, ele) {
        var uri = new mw.Uri(ele.href);
        delete uri.query.logoutToken;
        ele.href = uri;
    });
    if (mw.config.get("wgCanonicalSpecialPageName") === "Userlogout") {
        var context = $("#mw-content-text");
        if (!context.find("#mw-returnto")[0] && context.text().includes("If you wish to log out")) {
            var link = context.find("a[href*=logoutToken]").clone();
            link.attr("target", "_self").text("点此退出").addClass("mw-ui-button mw-ui-progressive").css("margin-left", ".25em");
            context.empty().text("如果您想退出萌百账号，请").append(link);
        }
    }
})();
