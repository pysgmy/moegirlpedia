/*
RedirectContribsToggle.js
Version 1.0
Made with ♥ by User:Leranjun
*/
$(function() {
    if (mw.config.get("wgPageName") !== "Special:用户贡献" || !$(".mw-tag-mw-new-redirect")[0]) {
        return;
    }
    $(mw.util.addPortletLink(
        "p-tb", "", "切换显示重定向贡献", "t-lr-RedirectContribsToggle", "切换显示重定向贡献"
    )).click(function(e) {
        e.preventDefault();
        $(".mw-tag-mw-new-redirect").toggle();
    });
});
