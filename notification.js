/*
	该插件可以在监视列表下的页面出现变动以及收到新通知时，实时向你推送系统桌面级别的通知(基于Notification API)，只要有萌百网页处于开启状态，即便没有在浏览萌百网站的标签页，浏览器最小化，也能收到通知。
	同时该插件会向条目右上角的“更多”菜单添加一个名为“实时通知”的按钮，点击后将打开插件的控制面板，你可以在那里设置插件的功能。
	另外，因为无法监听监视列表的变动，监视列表采用手动刷新的模式，当你将条目加入监视列表或移出监视列表后，需要进入“更多”中的实时通知控制面板，手动刷新监视列表。
	或者在每次重启浏览器后将自动刷新监视列表。
*/
 
$(() => {
  const notificationIcon = 'https://img.moegirl.org.cn/common/thumb/f/f6/%E8%93%9D%E8%90%8C%E5%AD%97.png/233px-%E8%93%9D%E8%90%8C%E5%AD%97.png'
  const workerUrl = window.mw ?
	'/index.php?title=User:東東君/js/notification.js/worker.js&action=raw&ctype=text/javascript' :
	'worker.js'
  
  checkNotificationPermission()
  main()
  
  async function main() {
    const worker = await registerService()
    const watchListListener = new WorkerDataListener(worker, 'watchList')
    const configListener = new WorkerDataListener(worker, 'config')
    const uiController = initUI({ onRefreshWatchList, onSaveConfig })
  
    watchListListener.pullData()
    configListener.pullData()
 
    watchListListener.addListener(data => {
      uiController.updateWatchListStatus({
        status: data.status,
        listLength: data.titleList.length,
        updateTime: data.updateTime.toLocaleString()
      })
    })
  
    configListener.addListener(data => {
      uiController.updateConfig(data)
    })
  
    function onRefreshWatchList() {
      worker.postMessage({ type: 'refreshWatchList' })
    }
  
    function onSaveConfig(config) {
      worker.postMessage({ type: 'saveConfig', data: { config } })
      alert('配置已保存')
    }
  }
 
  navigator.serviceWorker.addEventListener('message', e => {
    const { type, data } = e.data
    if (type === 'sendNotification') {
      const [title, options] = data
      const link = options.data.link
      new Notification(title, options).onclick = () => window.open(link, '_blank')
    }
  })
  
  function initUI({ 
    onRefreshWatchList, 
    onSaveConfig
  }) {
    const template = `
      <div class="widget-notification-config" style="display:none;">
        <div class="body">
          <fieldset class="watchList">
            <legend>监视列表</legend>
            <div>监视列表获取状态：<span class="status"></span></div>
            <div>监视列表总条数：<span class="listLength"></span></div>
            <div>上次刷新时间：<span class="updateTime"></span></div>
            <button class="refreshButton">立即刷新</button>
          </fieldset>
  
          <fieldset>
            <legend>设置</legend>
            <form class="settings" action="javascript:void(0)">
              <label>
                <span>开启</span>
                <input type="checkbox" name="enable">
              </label>
  
              <label>
                <span>监听监视列表</span>
                <input type="checkbox" name="listenWatchList">
              </label>
 
              <label>
                <span>监听新建条目</span>
                <input type="checkbox" name="listenNewArticle">
              </label>
  
              <label>
                <span>监听未读通知</span>
                <input type="checkbox" name="listenNotification">
              </label>
 
              <label>
                <span>使用更改摘要</span>
                <input type="checkbox" name="summaryChanges">
                <img 
                  src="https://img.moegirl.org.cn/common/3/35/Information_icon.svg" 
                  style="width: 16px; cursor:help;" 
                  title="开启后在监视列表下的多个条目发生变化后，将只推送一条变动条目列表的通知，防止被过多通知轰炸"
                >
              </label>
  
              <label>
                <div>排除条目：</div>
                <textarea placeholder="当其中的条目发生变化时不会通知，使用换行分割" name="excludeList"></textarea>
              </label>
  
              <div class="buttonGroup">
                <button class="saveConfig">保存</button>
                <button class="closeModal">关闭</button>
              </div>
            </form>
          </fieldset>
        </div>
      </div>
    `
  
    const cssStyle = `
      <style>
        .widget-notification-config {
          position: fixed;
          top: 0; 
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.2);
          font-size: 14px;
          z-index: 100;
        }
  
        .widget-notification-config > .body {
          background-color: white;
          width: 300px;
          box-sizing: border-box;
          padding: 10px;
          border-radius: 5px;
          border: 2px #ccc ridge;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
  
        .widget-notification-config > .body .watchList .refreshButton  {
          display: block;
          margin: 0 auto;
          margin-top: 10px;
        }
  
        .widget-notification-config > .body fieldset {
          margin: 0;
          padding-left: 15px;
          padding-right: 15px;
        }
  
        .widget-notification-config > .body .settings > label {
          display: block;
        }
  
        .widget-notification-config > .body .settings > label > * {
          vertical-align: middle;
        }
  
        .widget-notification-config > .body .settings textarea[name="excludeList"] {
          width: -webkit-fill-available;
          resize: none;
          margin-top: 5px;
          height: 100px;
          border: 1px #666 solid;
        }
        
        .widget-notification-config > .body .settings .buttonGroup {
          margin: 0 auto;
          margin-top: 10px;
          display: table;
        }
  
        .widget-notification-config > .body .settings .buttonGroup button {
          margin: 0 5px;
        }
      </style>
    `
  
    $('body').append(template).append(cssStyle)
  
    const rootEl = $('.widget-notification-config')
    const watchListEl = rootEl.find('.watchList')
    const settingsEl = rootEl.find('.settings')
  
    // 注入按钮
    $('#p-cactions ul').append('<li id="widget-notification-showConfig"><a title="实时通知">实时通知</a></li>')
  
    // modal显示事件
    $('#widget-notification-showConfig').on('click', () => rootEl.show())
  
    // modal关闭事件
    rootEl.find('.closeModal').on('click', () => rootEl.hide())
  
    // 刷新监视列表
    watchListEl.find('.refreshButton').on('click', onRefreshWatchList)
  
    // 保存配置
    rootEl.find('.saveConfig').on('click', e => {
      const formValues = {
        enable: settingsEl.find('[name="enable"]').prop('checked'),
        listenWatchList: settingsEl.find('[name="listenWatchList"]').prop('checked'),
        listenNotification: settingsEl.find('[name="listenNotification"]').prop('checked'),
        listenNewArticle: settingsEl.find('[name="listenNewArticle"]').prop('checked'),
        summaryChanges: settingsEl.find('[name="summaryChanges"]').prop('checked'),
        excludeList: settingsEl.find('[name="excludeList"]').val().trim().split('\n')
      }
  
      onSaveConfig(formValues)
    })
  
    function updateWatchListStatus({ status, listLength, updateTime }) {
      status && watchListEl.find('.status').text({
        initial: '未获取',
        loading: '获取中...',
        completed: '获取成功',
        error: '获取失败'
      }[status])
  
      watchListEl.find('.refreshButton').prop('disabled', status === 'loading')
      listLength !== undefined && watchListEl.find('.listLength').text(listLength)
      updateTime !== undefined && watchListEl.find('.updateTime').text(updateTime)
    }
  
    function updateConfig({ enable, listenWatchList, listenNotification, listenNewArticle, summaryChanges, excludeList }) {
      settingsEl.find('[name="enable"]').prop('checked', enable)
      settingsEl.find('[name="listenWatchList"]').prop('checked', listenWatchList)
      settingsEl.find('[name="listenNotification"]').prop('checked', listenNotification)
      settingsEl.find('[name="listenNewArticle"]').prop('checked', listenNewArticle)
      settingsEl.find('[name="summaryChanges"]').prop('checked', summaryChanges)
      settingsEl.find('[name="excludeList"]').val(excludeList.join('\n'))
    }
  
    return {
      updateWatchListStatus,
      updateConfig
    }
  }
  
  function registerService() {
    return new Promise(async (resolve, reject) => {
      if (Notification === undefined || navigator.serviceWorker === undefined) {
        alert('当前浏览器不支持通知插件，请从您的用户页中移除！')
        return reject()
      }
      
      if(Notification.permission === 'default') {
        alert('点击确定关闭这条消息后，将弹出授予通知权限的窗口，届时请点击“允许”，以保证插件的正常运行。')
      }
    
      await new Promise(Notification.requestPermission)
      const status = Notification.permission
    
      if (status === 'granted') {
        if (localStorage.getItem('moegirl-widget-notification-permission-granted') !== 'true') {
          localStorage.setItem('moegirl-widget-notification-permission-granted', 'true')
          new Notification('欢迎', {
            body: '您已经成功开启实时通知功能，欢迎使用！',
            icon: notificationIcon
          })
        }
      }
    
      if (status === 'denied') {
        alert('您未能正确授予通知权限，若要继续使用，请在url栏左侧点击小锁标志开启权限，若无法设置，请从你的用户页删去此插件。')
        return reject()
      }
  
      const serviceWorkerRegistration = await navigator.serviceWorker.register(workerUrl)
      await navigator.serviceWorker.ready
      resolve(serviceWorkerRegistration.active)
    })
  }
 
  function checkNotificationPermission() {
    if (localStorage.getItem('moegirl-widget-notification-permission-granted') === 'true' && Notification.permission !== 'granted') {
      localStorage.removeItem('moegirl-widget-notification-permission-granted')
    }
  }
  
  class WorkerDataListener {
    broadcastName = ''
    worker = null
    data = null
    #incrementPullId = 0
 
    get pullEventName() { return 'get-' + this.broadcastName }
    get broadcastChannelName() { return 'channel-' + this.broadcastName }
    
    constructor(worker, broadcastName) {
      this.broadcastName = broadcastName
      this.worker = worker
      this.broadcastChannel = new BroadcastChannel(this.broadcastChannelName)
  
      this.addListener(data => this.data = data)
    }
  
    addListener(handler) {
      const usingHandler = e => {
        const { type, data, id } = e.data
        type === 'broadcast' && handler(data, id)
      }
 
      this.broadcastChannel.addEventListener('message', usingHandler)
      return () => this.broadcastChannel.removeEventListener('message', usingHandler)
    }
  
    pullData() {
      const pullId = this.#incrementPullId++
      this.worker.postMessage({ type: this.pullEventName, data: { id: pullId } })
      return pullId
    }
  
    getData() {
      return new Promise(resolve => {
        const pullId = this.pullData()
        const removeListener = this.addListener((data, id) => {
          if (id !== pullId) { return }
          resolve(data)
          removeListener()
        })
      })
    }
  }
})
