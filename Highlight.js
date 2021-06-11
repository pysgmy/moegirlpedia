/**
 * @name highlight.js
 * @description 为页面内的代码块提供语法高亮
 */
!(async () => {
  // 为代码页面添加 class
  const pageName = mw.config.get('wgPageName')
  if (pageName.substr(pageName.length - 3, 3) === '.js') {
    $('#mw-content-text pre.mw-code').addClass('lang-js highlight linenums')
  } else if (pageName.substr(pageName.length - 4, 4) === '.css') {
    $('#mw-content-text pre.mw-code').addClass('lang-css highlight linenums')
  } else if (
    // Lua
    mw.config.get('wgNamespaceNumber') === 828 &&
    pageName.substr(pageName.length - 4, 4) !== '/doc'
  ) {
    $('#mw-content-text pre.mw-code').addClass('lang-lua highlight linenums')
  }
  // 兼容站内现有写法
  $('pre.prettyprint')
    .addClass('highlight')
    .removeClass('prettyprint')
  // 定死表格内pre的宽度，防止table的宽度异常导致抑郁
  $('#mw-content-text table:not(.mw-collapsible) pre.highlight').css('width', function() {
    return $(this).width() > 0 ? $(this).width() : undefined
  })
  // 加载脚本
  try {
    await $.ajax({
      url:
        'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.1/build/highlight.min.js',
      dataType: 'script',
      cache: true
    })
  } catch (err) {
    return console.warn('Highlight.js load error', err)
  }
  // 初始化高亮
  $('#mw-content-text pre.highlight').each(function(_, block) {
    const $block = $(block)
    // 高亮当前块
    if ($block.data('hljs') !== 'done') {
      hljs.highlightBlock(block)
      $block.data('hljs', 'done')
    }
    // 行号显示
    if (
      $block.data('line-from') !== undefined ||
      $block.data('line-ping') !== undefined
    ) {
      $block.addClass('linenums')
    }
    if ($block.hasClass('linenums')) {
      // 起始行号
      let lineNumFrom = parseInt($block.data('line-from'))
      if (isNaN(lineNumFrom) || lineNumFrom < 1) lineNumFrom = 1
      // 高亮行号
      let pingLine = $block.data('line-emphatic') || $block.data('line-ping')
      if (typeof pingLine === 'number') pingLine = [pingLine]
      if (typeof pingLine === 'string')
        pingLine = pingLine.replace(/\s/g, '').split(',')
      if (typeof pingLine !== 'object') pingLine = []
      $block.html(function() {
        const $thisBlock = $(this)
        // 创建 jQuery 对象
        const $html = $('<div>', { class: 'line-container' }).append(
          $('<div>', { class: 'line-content' }),
          $('<div>', { class: 'line-numbers' })
        )
        // 处理内部有换行的span标签
        $thisBlock.find('span').html(function() {
          const $span = $(this)
          let html = $span.html()
          let openTag = $span.prop('outerHTML').split('>')[0] + '>'
          html = html.replace(/\n/g, `</span>\n${openTag}`)
          return html
        })
        // 拆开每一行
        let splitHtml = $thisBlock.html().split('\n')
        $.each(splitHtml, (lineNum, lineContent) => {
          // 防止最后一行后被添加一行空行
          if (
            lineNum + 1 === splitHtml.length &&
            !lineContent
          ) return
          // 显示行号为起始行号加当前行号
          displayLineNum = lineNum + lineNumFrom
          // 是否高亮显示
          let isPing = ''
          if (pingLine.includes(lineNum + 1)) {
            isPing = 'line-ping'
          }
          // 添加行号
          $html.find('.line-numbers').append(
            $('<div>', {
              class: `line-number-block ${isPing}`,
              text: displayLineNum
            })
          )
          // 添加内容
          $html
            .find('.line-content')
            .append(
              $('<div>', { class: `line-row ${isPing}`, html: lineContent })
            )
        })
        return $html
      })
    }
  })
})()
