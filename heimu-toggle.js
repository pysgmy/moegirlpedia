// <pre>
$(function() {
    if (!$('.heimu, .colormu')[0] || $('#heimu_toggle')[0]) {
        return;
    }
    $(".colormu").each(function() {
        this.dataset.backgroundColor = $(this).css("background-color");
    });
    var body = document.body,
        html = document.documentElement;
    var innerWidth = window.innerWidth;
    var scrollbarWidth;
    switch ("scroll") {
        case getComputedStyle(body).overflowY:
            scrollbarWidth = innerWidth - body.clientWidth;
            break;
        case getComputedStyle(html).overflowY:
            scrollbarWidth = innerWidth - html.clientWidth;
            break;
        default:
            var backup = body.style.overflowY;
            body.style.overflowY = "scroll";
            scrollbarWidth = innerWidth - body.clientWidth;
            body.style.overflowY = backup;
    }
    var btn = $('<div/>', {
        id: 'heimu_toggle',
        text: '半隐黑幕',
        css: {
            'user-select': 'none',
        },
    }).appendTo(document.body).on('click', function() {
        if ($('body.heimu_toggle_on')[0]) $(this).text('半隐黑幕');
        else $(this).text('隐藏黑幕');
        $(document.body).toggleClass('heimu_toggle_on');
        $(".colormu").each(function() {
            if ($(this).hasClass("colormu_toggle_on")) {
                $(this).removeClass("colormu_toggle_on");
                $(this).css("background-color", this.dataset.backgroundColor);
            } else {
                $(this).addClass("colormu_toggle_on");
                $(this).css("background-color", this.dataset.backgroundColor.replace("rgb", "rgba").replace(")", ", .17)"));
            }
        });
    });
    if (scrollbarWidth === 0) {
        btn.css("right", "20px"); // 修复新版 Chrome 的自动隐藏式滚动条导致的按钮被覆盖 chrome://flags/#overlay-scrollbars
    }
    if (+mw.user.options.get("gadget-HeimuToggleDefaultOn", 0) === 1) {
        btn.click();
    }
});
// </pre>
