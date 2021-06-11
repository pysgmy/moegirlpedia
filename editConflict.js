(async () => {
    if (!["edit", "submit"].includes(mw.config.get("wgAction"))) {
        return;
    }
    await mw.loader.using("mw.Api");
    mw.loader.using('mediawiki.notification');
    const wgPageName = mw.config.get("wgPageName");
    const wgCurRevisionId = mw.config.get("wgCurRevisionId");
    let needCheckFlag = true;
    const api = new mw.Api({ timeout: 5000 });
    const wpSave = $("#wpSave");
    const editform = $("#editform");
    const conflictAlert = "请注意！如果您在没有备份您的编辑内容时就选择显示预览或更改，\n我们会无法检测到编辑冲突，\n并且届时您点下了保存按钮后您的编辑内容会直接丢失！！\n请备份您的编辑后刷新页面再进行相关操作！";
    const SYMBOL_UNDEFINED = Symbol("SYMBOL_UNDEFINED");
    wpSave.val = (value = SYMBOL_UNDEFINED) => {
        const val = $.fn.val.bind(wpSave);
        return value === SYMBOL_UNDEFINED ? val() : val(value).attr("title", value);
    };
    const disable = ($buttons) => {
        return $buttons.css("font-weight", "normal").parent().removeClass("oo-ui-widget-enabled oo-ui-flaggedElement-primary oo-ui-flaggedElement-progressive").addClass("oo-ui-widget-disabled");
    }
    wpSave.on("click", () => {
        if (needCheckFlag === true) {
            needCheckFlag = false;
            setTimeout(async () => {
                disable(wpSave.attr("disabled", "disabled").val("正在检查编辑冲突……"));
                for (let i = 1; i <= 4; i++) {
                    try {
                        const result = await api.post({
                            action: "query",
                            prop: "revisions",
                            rvprop: "ids",
                            rvlimit: 1,
                            titles: wgPageName,
                        });
                        const pageid = Object.keys(result.query.pages)[0];
                        if (pageid > 0 && result.query.pages[pageid].revisions[0].revid > wgCurRevisionId) {
                            wpSave.val("存在编辑冲突！");
                            $("body").append(`<div style="background: #3366CC; color: white; text-align: center; padding: .5rem; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;"><p>本页面已被他人更改。请复制您的编辑到剪贴板，然后刷新页面，重新开始编辑，以避免编辑冲突。</p><p><span id="copyCurrentRawCode" class="mw-ui-button">复制当前编辑内容</span> <span id="showNewestRevisionDiff" class="mw-ui-button">查看最新版本差异</span> <span id="refreshPage" class="mw-ui-button mw-ui-destructive">刷新页面（慎重！）</span></p></div>`);
                            const pre = $("<pre/>", {
                                css: {
                                    position: "absolute",
                                    left: "-99999px",
                                    "z-index": "-99999",
                                }
                            });
                            const textarea = $("#wpTextbox1");
                            $("#copyCurrentRawCode").on("click", async () => {
                                await mw.loader.using('mediawiki.notification');
                                $("#mw-notification-area").css({
                                    position: "fixed",
                                    top: 0,
                                }).appendTo("body");
                                if ($(".ace_editor").length > 0) {
                                    mw.notify("当前已开启代码编辑器，无法获取真实编辑内容，请手动复制。");
                                    return;
                                }
                                const selection = window.getSelection();
                                const rangeCount = selection.rangeCount;
                                let range;
                                if (rangeCount > 0) {
                                    range = selection.getRangeAt(0);
                                }
                                pre.text(textarea.val());
                                selection.selectAllChildren(pre[0]);
                                document.execCommand("copy");
                                window.setTimeout(function() {
                                    selection.removeAllRanges();
                                    if (rangeCount > 0) {
                                        selection.addRange(range);
                                    }
                                    pre.empty();
                                }, 0);
                                mw.notify("复制成功！");
                            });
                            $("#showNewestRevisionDiff").on("click", () => {
                                window.open(`${mw.config.get("wgServer")}${mw.config.get("wgScriptPath")}/index.php?diff=${result.query.pages[pageid].revisions[0].revid}`, "_blank").focus();
                            });
                            $("#refreshPage").on("click", () => {
                                if (confirm("您是否已经复制好您的编辑内容？\n刷新后原来的编辑内容将会被最新版本的源码替换！\n点击确定将会刷新页面！！")) {
                                    location.reload(false);
                                }
                            });
                            disable($("#wpPreview, #wpDiff").on("click", () => {
                                setTimeout(() => {
                                    alert(conflictAlert);
                                }, 1);
                                return false;
                            }).attr("title", conflictAlert));
                        } else {
                            wpSave.val("没有编辑冲突，正在保存……");
                            editform.submit();
                        }
                        await mw.loader.using('mediawiki.notification');
                        return;
                    } catch (e) {
                        console.error("editConflict", e);
                        wpSave.val(i <= 3 ? `编辑冲突检查失败，正在重试（第${i}次）……` : "编辑冲突检查失败，请稍后重试……");
                    }
                }
                setTimeout(() => {
                    needCheckFlag = true;
                    wpSave.removeAttr("disabled").val("保存更改").css("font-weight", "700").parent().addClass("oo-ui-widget-enabled oo-ui-flaggedElement-primary oo-ui-flaggedElement-progressive").removeClass("oo-ui-widget-disabled");
                }, 2000);
            }, 1);
        }
        return false;
    });
})();
