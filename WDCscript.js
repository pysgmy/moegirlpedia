if ($(".wdc-wrapper")[0]) {
    const c1 = "font-size:1.5em;color:#ED5564",
        c2 = "font-size:1.5em;color:#FFCE54",
        c3 = "font-size:1.5em;color:#A0D568",
        c4 = "font-size:1.5em;color:#4FC1E8",
        c5 = "font-size:1.5em;color:#AC92EB";
 
    console.log("%c" + decodeURIComponent("%E2%96%88%E2%96%88%E2%80%83%20%20%20%20%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%80%83%20%20%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%80%83%0A") + "%c" + decodeURIComponent("%E2%96%88%E2%96%88%E2%80%83%20%20%20%20%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%80%83%E2%80%83%E2%80%83%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%80%83%E2%80%83%E2%80%83%E2%80%83%E2%80%83%E2%80%83%0A") + "%c" + decodeURIComponent("%E2%96%88%E2%96%88%E2%80%83%20%E2%96%88%E2%80%83%20%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%80%83%20%20%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%80%83%20%20%20%20%20%0A") + "%c" + decodeURIComponent("%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%80%83%20%20%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%80%83%20%20%20%20%20%0A") + "%c" + decodeURIComponent("%E2%80%83%E2%96%88%E2%96%88%E2%96%88%E2%80%83%E2%96%88%E2%96%88%E2%96%88%E2%80%83%E2%80%83%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%80%83%E2%80%83%E2%80%83%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%20%0A") + "\n%cW%ci%cn%cd%co%cw%cs %cD%ce%cs%ck%ct%co%cp %cC%cl%co%cn%ce %cv%c1%c.%c0\n%cB%cy %cU%cs%ce%cr%c:%cL%ce%cr%ca%cn%cj%cu%cn",
        "font-size:2em;color:#ED5564",
        "font-size:2em;color:#FFCE54",
        "font-size:2em;color:#A0D568",
        "font-size:2em;color:#4FC1E8",
        "font-size:2em;color:#AC92EB",
        c1, c2, c3, c4, c5, c1, c2, c3, c4, c5, c1, c2, c3, c4, c5, c1, c2, c3, c4, c5, c1, c2, c3, c4, c5, c1, c2, c3, c4, c5, c1, c2, c3, c4, c5, c1, c2, c3);
 
    $(".wdc-js-notice").hide();
 
    /* 
    Grid fixed (at least better /shrug), no need to fallback for now
 
    // Safari fallback
    const UA = navigator.userAgent;
    if (UA.includes("Safari/") && !UA.includes("Chrome/") && !UA.includes("Chromium/")) {
        $(".wdc-personalisation").hide();
        $(".wdc-wrapper").hide();
        $(".wdc-fallback").removeClass("mobileonly");
        throw new Error("WDC: Safari detected, stopping script.");
    }
 
    */
 
    /*
    Implemented with {{tl|切换显示按钮}}
 
    // Start menu
    const startIcon = $(".wdc-taskbar-start-icon-wrapper");
    const startMenu = $(".wdc-start-wrapper");
    startIcon.css("cursor", "pointer");
    startMenu.removeClass("textToggleDisplay hidden");
    $("label[data-id='start']").remove();
    startMenu.css("display", "none");
    startIcon.click(function() {
        startMenu.fadeToggle();
    });
 
    */
 
    // User avatar
    const username = mw.config.get("wgUserName");
    $(".wdc-start-user-avatar").attr("src", "https://commons.moegirl.org/extensions/Avatar/avatar.php?user=" + username);
 
    // Blurring
    const startMenu = $(".wdc-start-wrapper");
    const taskBar = $(".wdc-taskbar-wrapper");
    startMenu.css("backdrop-filter", "blur(5px)");
    taskBar.css("backdrop-filter", "blur(5px)");
 
    // Clock
    const check0 = function (t) {
        return ('0' + t).slice(-2);
    };
 
    setInterval(function () {
        const d = new Date();
        const t = check0(d.getHours()) + ":" + check0(d.getMinutes()) + ":" + check0(d.getSeconds());
        $(".wdc-clock-time").text(t);
    }, 1000);
}
