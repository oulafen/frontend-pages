
/**
 * calculate root font-size for diff device when using rem
 * **/
(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            var fontSize = 20 * (clientWidth / 320);
            /** 根font-size最大值为30px **/
            docEl.style.fontSize = fontSize > 30 ? '30px' : fontSize + 'px';
        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);

$(function () {
    avatarLoad.init();
    if($('.runroom-grade-content')[0] ||$('.runroom-rank-content')[0] || $('.medal-content')[0]){
        setFullContentHeight()
        $(window).resize(function(){
            setFullContentHeight();
        })
    }
});

function setFullContentHeight(){
    var contentHeight = $(window).height() - $('.footer').height();
    $('.runroom-rank-content').css('min-height', contentHeight);
    $('.runroom-grade-content').css('min-height', contentHeight);
    $('.medal-content').css('min-height', $(window).height());
}

var avatarLoad = {
    init: function(){
        var avatarObjs = $('img[data-src]');
        for(var i = 0, len = avatarObjs.length; i < len; i++){
            avatarObjs.eq(i).attr('src', avatarObjs.eq(i).data('src'));
        }

        avatarObjs.on('error', function(){
            $(this).attr('src', 'images/avatar-default.png')
                .css('border', 'none !important');
        })
    }
};