window.LocalComments = $.extend({
    enabled: true,
}, {
    excludeNamespaces: Object.keys(mw.config.get("wgFormattedNamespaces")).map(function (ns) { return +ns; }).filter(function (ns) { return ns < 0 || ns % 2 === 0; }),
}, window.LocalComments);
if (window.LocalComments.enabled &&
    !window.LocalComments.excludeNamespaces.includes(mw.config.get("wgNamespaceNumber")) && ["view", "submit"].includes(mw.config.get("wgAction")) &&
    mw.util.getParamValue("disable") !== "loco") {
    mw.loader.load(mw.config.get("wgServer") + mw.config.get("wgScriptPath") + "/index.php?title=User:AnnAngela/js/CommentsInLocalTime.js&action=raw&ctype=text/javascript");
}
