/*
RefToggle v1.1
By [[enwiki:User:Zhaofeng Li]]
Modified with ♥ by User:Leranjun
 
Original script: https://en.wikipedia.org/wiki/User:Zhaofeng_Li/RefToggle
*/
 
$(function() {
    if ($(".reference")[0]) {
        var refToggle = mw.util.addPortletLink(
            "p-tb", "", "隐藏参考资料", "t-RefToggle", "切换显示参考资料"
        );
        const link = $("#t-RefToggle").children(":first");
        $(refToggle).click(function(e) {
            e.preventDefault();
            $(".reference").toggle();
            if (link.text() === "隐藏参考资料")
                link.text("显示参考资料");
            else
                link.text("隐藏参考资料");
        });
    }
});
