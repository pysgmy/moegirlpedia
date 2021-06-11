/*
 * ***mw 不能用箭頭函數，請用油猴或其他工具載入，或幫我修改***
 * 鼠標懸浮在消歧義鏈接旁標識符上顯示或刷新義項，移開懸浮框退出
 * 暫未想到點擊直接編輯的方法，故為義項鏈接
 * 備用思路：1. 浪費資源地每一個鏈接都查詢是否為消歧義頁；
             2. 從 html 按順序獲得内鏈
 * 如有想法歡迎告知
 */
$(function () {
    $('body').append(`<style>
    div.disambig-box {
        width: 160px;
        max-height: 200px;
        overflow-y: scroll;
        border-radius: 2px;
        box-shadow: 1px 10px 10px -1px rgba(0, 0, 0, 0.2);
        margin: 0;
        padding: 0;
        color: #000;
        background: #FFF;
        position: absolute;
        font-size: 14px;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
        text-align: left;
        display: none;
        transition: all 500ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
    }
    .disambig-box ul.disambig-ul {
        list-style: none;
        padding: 0 !important;
        margin: 0 !important;
    }
    .disambig-box li {
        cursor: pointer;
        padding: 2px 10px;
        transition: all 500ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
    }
    .disambig-box li:hover {
        background: #F0F0F0;
    }
    .disambig-box li a {
        color: #000 !important;
        text-decoration: none;
    }
    </style>`);
    const msg = {
        loading: 'Loading...',
        failed: 'Failed to load.',
    };
    switch (mw.config.get().wgUserLanguage) {
        case 'zh-hant':
            msg.loading = '加載中……';
            msg.failed = '加載失敗';
            break;
        case 'zh':
        case 'zh-hans':
            msg.loading = '加载中……';
            msg.failed = '加载失败';
            break;
    }
    $('.mw-disambig').each(function(){
        const title = decodeURI($(this).attr('href').substring(1)).replace('%2F', '/');
        $(this).after(
            $('<div>', {
                id: title, // 問題：相同的消歧義鏈接
                class: 'disambig-box',
            }).on('mouseleave', () => {
                $(`#${title}`).hide(150, 'swing');
            }).append('<ul class="disambig-ul">'),
            $('<sup>').append($('<a>', {
                href: 'javascript:void(0)',
                text: '?',
            }).on('mouseenter', () => {
                $(`#${title}`).css({
                    'left': $(this).position()['left'] + 10,
                    'top': $(this).position()['top'] + 16,
                });
                $(`#${title} ul`).empty().append(`<li>${msg.loading}</li>`);
                $(`#${title}`).show(150, 'swing');
                let lines = new Array();
                new mw.Api().get({
                    action: 'parse',
                    page: title,
                    redirects: true,
                    prop: 'wikitext',
                    format: 'json',
                }).done((data) => {
                    lines = data.parse.wikitext['*'].split('\n').map(
                        line => line.substring(0, line.indexOf('————'))
                    ).map(line => {
                        if (line.match(/(?<=\[\[).+?(?=\]\])/g)) {
                            return line.match(/(?<=\[\[).+?(?=\]\])/g)
                        } else if (line.match(/(?<=\{\{(dis|dl)\|).+?(?=\}\})/gi)) { // {{dis}}, {{dl}}
                            return line.match(/(?<=\{\{(dis|dl)\|).+?(?=\}\})/gi)
                        } else if (line.match(/(?<=\{\{coloredlink\|).+?(?=\}\})/gi)) { // {{coloredlink}}
                            return line.match(/(?<=\{\{coloredlink\|).+?(?=\}\})/gi).map(
                                line => line.substring(line.indexOf('|') + 1)
                            )
                        }
                    }).flat().filter(line => line).map(
                        line => line.indexOf('|') !== -1 ? line.substring(0, line.indexOf('|')) : line
                    );
                    $(`#${title} ul`).empty();
                    for (const line of lines) {
                        $(`#${title} ul`).append(`<li><a href="/${line}">${line}</a></li>`);
                    }
                }).fail((a, b, errorThrown) => {
                    $(`#${title} ul`).empty().append(`<li>${msg.failed}</li>`);
                });
            }))
        );
    });
});
