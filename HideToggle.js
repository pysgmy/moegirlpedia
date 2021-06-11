/*
HideToggle.js
Version 1.1
Made with ♥ by User:Leranjun
*/
 
$(function() {
    const valid = $(".mw-collapsible-toggle").filter(function() {
        return ($(this).closest(".navbox").length === 0);
    });
    let toggleText = null;
    if (valid[0]) {
        if (valid.filter(".mw-collapsible-toggle-collapsed")[0]) {
            toggleText = "展开Hide模板";
        } else {
            toggleText = "折叠Hide模板";
        }
    }
 
    if (toggleText == null) {
        return;
    }
 
    const hideToggle = mw.util.addPortletLink(
        "p-tb", "", toggleText, "t-lr-HideToggle", "切换显示Hide模板"
    );
    const link = $("#t-lr-HideToggle").children(":first");
    $(hideToggle).click(function(e) {
        e.preventDefault();
        if (toggleText === "折叠Hide模板") {
            valid.not(".mw-collapsible-toggle-collapsed").click();
            toggleText = "展开Hide模板";
            link.text(toggleText);
        } else {
            valid.filter(".mw-collapsible-toggle-collapsed").click();
            toggleText = "折叠Hide模板";
            link.text(toggleText);
        }
    });
});
