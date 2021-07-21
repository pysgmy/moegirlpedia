$(function() {
    if ($('#toc')[0] && mw.config.exists('wgFlowThreadConfig')) { //同时存在Flowthread评论栏和目录的页面，在目录添加Flowthread评论栏链接
        $('#toc li.toclevel-1:last').after('<li class="toclevel-1"><a href="#flowthread"><span class="tocnumber">' + (parseInt($('#toc li.toclevel-1 span.tocnumber:last').text()) + 1) + '</span> <span class="toctext">评论栏</span></a></li>');
    }
});
