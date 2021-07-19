/*
MarkForDeletion.js
by User:AnnAngela
Adapted for EnMGP by User:Leranjun

Original script: https://zh.moegirl.org.cn/MediaWiki:Gadget-registerToDelete.js

*/

// <pre>
$(function () {
    var self = $("#p-cactions .menu ul");
    if (!self.find("li")[0] || $(".will2Be2Deleted")[0] || mw.config.get("wgUserGroups").indexOf("patroller") === -1) return;
    $("<a/>", {
        attr: {
            href: "#",
            title: "Mark this page for deletion [alt-shift-d]",
            accesskey: "d",
        },
        text: "Mark for deletion",
    })
        .on("click", function () {
            var reason = prompt(
                    'Reason for marking (will replace text)\n(Default reason: "Discussion board nomination: No longer used")\n(Press Cancel to cancel):'
                ),
                self = $(this);
            if (reason === null) return;
            if (reason === "") reason = "Discussion board nomination: No longer used";
            var loadingBox = $("<div/>", {
                    css: {
                        position: "fixed",
                        top: "0",
                        left: "0",
                        height: "100vh",
                        width: "100vw",
                        transition: "opacity .73s linear",
                        color: "black",
                        "padding-top": "49vh",
                        "background-color": "rgba(255,255,255,0.73)",
                        "text-align": "center",
                    },
                }).append(
                    '<img src="https://img.moegirl.org.cn/common/d/d1/Windows_10_loading.gif" style="height: 1em; margin-top: -.25em;">Marking in progress...'
                ),
                reasonText = reason ? "|" + reason : "",
                api = new mw.Api();
            loadingBox.endOut = function endOut() {
                this.css("color", "red")
                    .text("Marking failed...")
                    .delay(1000)
                    .queue(function () {
                        $(this)
                            .css("opacity", "0")
                            .delay(730)
                            .queue(function () {
                                $(this).remove();
                                $(document.body).css("overflow", "auto");
                                $(this).dequeue();
                            });
                        $(this).dequeue();
                    });
            };
            $(document.body).append(loadingBox).css("overflow", "hidden");
            api.postWithToken("csrf", {
                action: "edit",
                format: "json",
                title: mw.config.get("wgPageName"),
                text: "<noinclude>{{d" + reasonText + "|user=" + mw.config.get("wgUserName") + "}}</noinclude>",
                summary: "Mark for deletion: " + reason,
                nocreate: true,
                watchlist: "preferences",
            }).then(function (d) {
                if (d.error) return loadingBox.endOut();
                loadingBox.css("color", "green").text("Marked successfully! Refreshing...");
                window.setTimeout(function () {
                    window.location.reload();
                }, 730);
            }, loadingBox.endOut.bind(loadingBox));
        })
        .appendTo(
            $("<li/>", {
                attr: {
                    id: "ca-markForDeletion",
                },
            }).prependTo(self)
        );
});
// </pre>
