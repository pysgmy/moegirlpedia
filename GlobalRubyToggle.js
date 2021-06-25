var widgetHideRuby = (function () {
    var hideRuby = 0;
    return function (button, element) {
        // button控制element中所有ruby的显隐
        button.bind('click', function () {
            var elements = element.find('ruby').find('rt,rp');
            if (hideRuby == 1) {
                hideRuby = 0;
                elements.css('display', '');
            } else {
                hideRuby = 1;
                elements.css('display', 'none');
            }
 
        });
    };
}());
$(function () {
    if ($('.HideRuby')[0]) return;
    $(document).find('body').append('<div class="HideRuby" title="Ruby开关" style="transition: .37s all ease-in-out;user-select: none; width: 20px;padding: 5px 0; background-color: #000; color: #fff; font-size: 12px; text-align: center; position: fixed; right: 0; cursor: pointer; opacity: .6; bottom: 100px;">R<br />u<br />b<br />y<br />开关</div>');
    $(document).find('body').show();
 
    var button = $('.HideRuby');
    if ($('.backToTop')[0])
	    $(window).on('scroll', function () {
	        if ($('#heimu_toggle')[0]) {
	            $(document).scrollTop() > 0 ? button.css('bottom', '286px') : button.css('bottom', '193px');
	        } else {
	            $(document).scrollTop() > 0 ? button.css('bottom', '193px') : button.css('bottom', '100px');
	        }
	    }).scroll();
    widgetHideRuby(button, $(document));
});
