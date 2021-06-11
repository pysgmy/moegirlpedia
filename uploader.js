'use strict'
 
const cdnUrl = {
  requireJs: 'https://unpkg.com/requirejs@2.3.6/require.js',
  jss: 'https://unpkg.com/jss/dist/jss.min.js',
  jssPreset: 'https://unpkg.com/jss-preset-default/dist/jss-preset-default.min.js',
  vue: 'https://unpkg.com/vue@2.6.11/dist/vue.min.js'
  // vue: 'https://unpkg.com/vue@2.6.11/dist/vue.js'
}
 
/**
 * @param {string} sourceUrl 
 */
function loadScript(sourceUrl) {
  return new Promise((resolve, reject) => {
    const scriptTag = document.createElement('script')
    scriptTag.src = sourceUrl
    document.body.appendChild(scriptTag)
  
    scriptTag.addEventListener('load', resolve)
    scriptTag.addEventListener('error', reject)
  })
}
 
/**
 * @param {Array<object>} modulePaths
 * type ModulePaths = { [moduleName: string]: string }[]
 */
async function loadModules(modulePaths) {
  return new Promise((resolve, reject) => {
    const trimTailJs = url => url.replace(/\.js$/, '')
 
    const paths = modulePaths.reduce((result, item) => {
      result[Object.keys(item)[0]] = trimTailJs(Object.values(item)[0])
      return result
    }, {})
    const loadModuleNames = modulePaths.map(item => Object.keys(item)[0])
 
    require.config({ paths })
    require(loadModuleNames, (...modules) => resolve(modules), reject)
  })
}
 
/**
 * @param {object} data 
 */
function request(data) {
  data.origin = 'https://zh.moegirl.org.cn'
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: 'https://commons.moegirl.org.cn/api.php',
      type: 'post',
      timeout: 15000,
      xhrFields: { withCredentials: true },
      data: data
    }).done(resolve).fail(reject)
  })
}
 
/**
 * @param {string} word 
 */
function getHints(word) {
  return request({
    "action": "query",
    "format": "json",
    "list": "search",
    "srsearch": word,
    "srnamespace": "14",
    "srlimit": "20"
  })
}
 
function getToken() {
  return request({
    "action": "query",
    "format": "json",
    "meta": "tokens",
  }).then(function (data) {
    return data.query.tokens.csrftoken
  })
}
 
/**
 * @param {object} options
 * @param {File} options.body
 * @param {string} options.fileName
 * @param {string} options.comment
 * @param {string} options.pageContent  
 */
function upload({ body, fileName, comment, pageContent }) {
  return new Promise(function (resolve, reject) {
    getToken()
      .then(function (token) {
        var data = {
          filename: fileName,
          comment: comment,
          text: pageContent,
          action: 'upload',
          format: 'json',
          ignorewarnings: true,
          token: token,
          origin: "https://zh.moegirl.org.cn"
        }
 
        if (typeof body == 'string') {
          data.url = body
        } else {
          data.file = body
        }
 
        var formData = new FormData()
        Object.keys(data).forEach(function (key) {
          formData.append(key, data[key])
        })
 
        $.ajax({
          url: 'https://commons.moegirl.org.cn/api.php',
          type: 'post',
          timeout: 20000,
          xhrFields: { withCredentials: true },
          contentType: false,
          processData: false,
          data: formData
        })
          .done(data => {
          	if ('error' in data) return reject(data.error)
          	resolve(data)
          })
          .fail(() => reject())
      })
      .catch(reject)
  })
}
 
/**
 * @param {string[]} fileNames 
 */
function checkFileNames(fileNames) {
  return request({
    action: 'query',
    format: 'json',
    titles: fileNames.map(item => 'File:' + item).join('|'),
    prop: '',
  }).then(function (data) {
    return Object.values(data.query.pages).reduce((result, item) => {
      result[item.title.replace('File:', '')] = !('missing' in item)
      return result
    }, {})
  })
}
 
$(() => (async () => {
  //await loadScript(cdnUrl.requireJs)
  //const [
  //  { default: jss },
  //  { default: jssPreset },
  //  Vue,
  //] = await loadModules([
  //  { jss: cdnUrl.jss },
  //  { jssPreset: cdnUrl.jssPreset },
  //  { Vue: cdnUrl.vue }
  //])
 
  //jss.setup(jssPreset())
  //$(document.body).append('<div id="widget-fileUploader" style="display:none">')
  
  // 向“更多”菜单注入按钮
  $('#p-cactions ul').append('<li id="btn-fileUploader"><a title="上传文件">上传文件</a></li>')
  $('#btn-fileUploader').click(() => {
  	alert('因技术问题，请前往图站使用批量上传工具')
  	window.open('https://commons.moegirl.org.cn/MediaWiki:Uploader', '_blank')
    // $('#widget-fileUploader').fadeIn(200)
    // $('#content').css('position', 'static')
  })
 
  return false
 
  const template = `
    <div id="widget-fileUploader" :class="s.container">
      <input 
        ref="fileInput"
        style="display:none"
        type="file" 
        multiple="multiple" 
        :accept="allowedFileTypes.map(item => '.' + item).join(',')"
        @change="addFileByFileSelector"
      />
      <div :class="s.closeBtn" @click="hideWidget">×</div>
      
      <div :class="s.body">
        <div 
          :class="s.fileList"
          @dragenter.prevent="() => {}"
          @dragover.prevent="() => {}"
          @drop.prevent="addFileByDropping"
        >
          <div 
            v-if="files.length === 0"
            key="hintMask" 
            class="hintMask" 
            @click="$refs.fileInput.click()"
          >
            <div class="hintText">点此添加文件，或将文件拖放至此</div>
          </div>
 
          <div 
            v-for="(item, index) in files" 
            :key="item.body.lastModified" 
            class="item"
            :data-name="item.fileName"
            :data-selected="index === focusedFileIndex"
            title="单击选中文件，双击复制文件名"
            @click="focusFile(index)"
          >
            <img 
              v-if="isImageFile(item.body)"
              :src="item.objectUrl" 
            />
            <div v-else class="unablePreviewHint">
              <div>不支持预览的文件类型</div>
              <div 
                v-if="typeof item.body !== 'string'" 
                class="type"
              >Mimetype: {{ item.body.type }}</div>
            </div>
            <div class="removeBtn" @click.stop="files.splice(index, 1)">×</div>
          </div>
 
          <div
            v-if="files.length !== 0"
            class="item addFileBox"
            @click="$refs.fileInput.click()"
          />
        </div>
 
        <div :class="s.panel">
          <div class="block">
            <div class="input-container" title="上传后使用文件时的名字，要求不能和现有文件重复">
              <span>文件名：</span>
              <input v-model.trim="form.fileName" />
            </div>
 
            <div class="input-container categoryInput" title="所有文件共享分类">
              <span>分　类：</span>
              <input 
                ref="categoryInput"
                v-model.trim="form.categoryInput" 
                @input="loadCategoryHint" 
                @keydown.enter="addCategory(form.categoryInput)"
                @keydown.up.prevent="handlerFor_categoryInput_wasKeyDowned"
                @focus="categoryFocused = true"
                @blur="categoryFocused = false"
              />
              <div class="inputHint">按下回车添加分类</div>
              <div 
                ref="categoryHints"
                v-if="categoryFocused && categoryHints.length !== 0"
                class="categoryHints" 
                tabindex="0"
                @keydown.enter="addCategory(categoryHints[categoryHintFocusedIndex])"
                @keydown.prevent="handlerFor_categoryHints_wasKeyDowned"
                @focus="categoryFocused = true"
                @blur="categoryFocused = false"
              >
                <div 
                  v-for="(item, index) in categoryHints"
                  class="item"
                  :data-selected="index === categoryHintFocusedIndex"
                  @click="addCategory(item)"
                >{{ item }}</div>
              </div>
            </div>
 
            <div class="categories">
              <div 
                v-for="(item, index) in form.categories"
                class="item"
                title="点击删除分类"
                @click="form.categories.splice(index, 1)"
              >{{ item }}</div>
            </div>
          </div>
          
          <div class="block">
            <div class="input-container">
              <span>角色名：</span>
              <input v-model.trim="form.charaName" />
            </div>
            
            <div class="input-container">
              <span>作　者：</span>
              <input v-model.trim="form.author" />
            </div>
 
            <div class="input-container">
              <span>源地址：</span>
              <input v-model.trim="form.source" />
            </div>
          </div>
 
          <div 
            class="block"
            style="flex-direction:column; justify-content:space-around; align-items:flex-start;"
          >
            <div class="input-container" title="所有文件共享前缀">
              <span>添加前缀：</span>
              <input v-model.trim="form.prefix" style="width:calc(100% - 6em)" />
            </div>
 
            <div 
              class="input-container" 
              style="justify-content:flex-start;"
            >
              <select v-model.trim="form.license">
	            <option disabled="disabled" value="">选择授权协议(将鼠标放在选项上显示详情)</option>
            	<optgroup label="CC协议">
                  <option value="CC Zero" title="作者授权以无著作权方式使用">CC-0</option>
                  <option value="CC BY" title="作者授权以署名方式使用，该授权需兼容3.0协议">CC BY 3.0</option>
                  <option value="CC BY-SA" title="作者授权以署名-相同方式方式使用，该授权需兼容3.0协议">CC BY-SA 3.0</option>
                  <option value="CC BY-NC-SA" title="作者授权以署名-非商业使用-相同协议方式使用，该授权需兼容3.0协议">CC BY-NC-SA 3.0</option>
            	</optgroup>
                <optgroup label="公有领域">
                  <option value="PD-Old">作者离世一定年限后流入公有领域</option>
                  <option value="PD-Other">其他原因流入公有领域</option>
                </optgroup>
    			<optgroup label="其他">
    			  <option value="Copyright" title="原作者没有明确的授权声明">原作者保留权利</option>
                  <option value="none:gotoCommons">原作者授权萌百使用</option>
                  <option value="可自由使用" title="作者放弃版权或声明可自由使用">可自由使用</option>
                  <option value="萌娘百科版权所有">萌娘百科版权所有</option>
    			</optgroup>
              </select>
            </div>
 
            <div class="buttons">
              <button @click="addSourceUrlFile">添加源地址文件</button>
              <button :disabled="status === 2" title="执行上传文件" @click="submit(false)">上传</button>
              <button 
                :disabled="status === 2" 
                title="在发生文件名已存在的情况时，自动滤掉已存在的文件。通常用于在上一次批量上传中一部分失败后，再次尝试将之前没传上去的文件重新上传" 
                @click="submit(true)"
              >差分上传</button>
              <button title="将当前文件除文件名的信息同步到全部文件" @click="asyncCurrentFileInfo">同步文件信息</button>
              <button @click="showManual">使用说明</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
 
  new Vue({
    el: '#widget-fileUploader',
    template,
 
    data() {
      return {
        s: createStyles(), // 样式
        allowedFileTypes: ['ogg', 'ogv', 'oga', 'flac', 'opus', 'wav', 'webm', 'mp3', 'png', 'gif', 'jpg', 'jpeg', 'webp', 'svg', 'pdf', 'ppt', 'jp2', 'doc', 'docx', 'xls', 'xlsx', 'psd', 'sai', 'swf', 'mp4'],
 
        files: [], // 待上传的文件
        focusedFileIndex: 0,
        categoryHints: [],
        categoryInputDebounceTimeoutKey: 0,
        categoryHintFocusedIndex: -1,
        categoryFocused: false,
        status: 1, // 0：失败，1：初始化，2：提交中，3：成功
        form: {
          fileName: '',
          categoryInput: '', // 分类输入栏
          categories: [], // 实际要提交的分类
          charaName: '',
          author: '',
          source: '',
          prefix: '',
          license: ''
        },
        doubleClickTimeoutKey: 0  // 用于双击复制文件名 
      }
    },
 
    mounted() {
      $('#widget-fileUploader').hide()
    },
 
    watch: {
      files() {
        this.focusedFileIndex === 0 && this.focusFile(0)
      },
 
      form: {
        deep: true,
        handler() {
          if (!this.files[this.focusedFileIndex]) { return }
 
          this.files[this.focusedFileIndex] = {
            ...this.files[this.focusedFileIndex],
            fileName: this.form.fileName,
            author: this.form.author,
            charaName: this.form.charaName,
            source: this.form.source,
            license: this.form.license
          }
        }
      },
 
      license(val) {
        if (val === 'none:gotoCommons') {
          alert('该协议需要手动填写授权证明，请到共享站进行上传')
          window.open('https://commons.moegirl.org.cn/Special:上传文件', '_blank')
        }
      }
    },
 
    computed: {
      license() {
        return this.form.license
      },
    },
 
    methods: {
      createFileItem(fileBody) {
        return {
          body: fileBody,
          objectUrl: typeof fileBody === 'string' ? fileBody : URL.createObjectURL(fileBody),
          fileName: typeof fileBody === 'string' ? fileBody.replace(/.+\/(.+?)$/, '$1') : fileBody.name,
          author: '',
          charaName: '',
          source: '',
          license: 'Copyright'
        }
      },
      
      isImageFile(fileBody) {
        const imageType = ['jpg', 'png', 'jpeg', 'gif', 'webp']
        return imageType.includes((typeof fileBody === 'string' ? fileBody : fileBody.name).replace(/.+\.(.+?)$/, '$1'))
      },
 
      hideWidget() {
        $('#widget-fileUploader').fadeOut(200)
        $('#content').css('position', 'relative')
      },
 
      loadCategoryHint() {
        clearTimeout(this.categoryInputDebounceTimeoutKey)
        this.categoryInputDebounceTimeoutKey = setTimeout(() => {
          if (this.form.categoryInput === '') { return }
          getHints(this.form.categoryInput)
            .then(data => {
              const hints = data.query.search.map(item => item.title.split('Category:')[1])
              this.categoryHints = hints
            })
        }, 500)
      },
 
      resetCategory() {
        this.form.categoryInput = '' 
        this.categoryHints = []
        this.categoryHintFocusedIndex = -1
      },
 
      addCategory(categoryName) {
        if (this.form.categories.includes(categoryName)) return mw.notify('请不要重复添加分类') 
        this.form.categories.push(categoryName)
        this.resetCategory()
      },
 
      // 实现上下键切换分类提示
      handlerFor_categoryHints_wasKeyDowned(e) {
        if (e.code === 'ArrowUp') {
          this.categoryHintFocusedIndex++
          if (this.categoryHintFocusedIndex > this.categoryHints.length - 1) {
            this.categoryHintFocusedIndex = 0
          }
        }
        
        if (e.code === 'ArrowDown') {
          this.categoryHintFocusedIndex--
          if (this.categoryHintFocusedIndex < 0) {
            this.$refs.categoryInput.focus()
          }
        }
 
        this.categoryHintFocusedIndex >= 0 && this.$refs.categoryHints.querySelectorAll('div')[this.categoryHintFocusedIndex].scrollIntoView()
      },
 
      handlerFor_categoryInput_wasKeyDowned() {
        if (this.categoryHints.length === 0 || !this.$refs.categoryHints) { return }
        this.$refs.categoryHints.focus()
        this.categoryHintFocusedIndex = 0
      },
      
      addFileByFileSelector(e) {
        const originalFileList = e.target.files
        ;[].forEach.call(originalFileList, file => {
          if (this.files.length === 50) { return }
          
          if (file.size / 1024 / 1024 > 20) return alert(`文件【${file.name}】大小超过20m，无法上传！`)
          this.files.push(this.createFileItem(file))
        })
 
        e.target.value = ''
        if (this.files.length === 50) mw.notify('一次最多上传50个文件', { type: 'wran' })
      },
 
      addFileByDropping(e) {
        const originalFileList = e.dataTransfer.files
        ;[].forEach.call(originalFileList, file => {
          if (this.files.length === 50) { return }
          
          if (!this.allowedFileTypes.includes(file.name.replace(/.+\.(.+?)$/, '$1'))) return alert(`【${file.name}】不支持上传这种格式的文件！`) 
          if (file.size / 1024 / 1024 > 20) return alert(`【${file.name}】的大小超过20m，无法上传！`)
          this.files.push(this.createFileItem(file))
        })
 
        if (this.files.length === 50) mw.notify('一次最多上传50个文件', { type: 'wran' })
      },
 
      focusFile(index) {
        this.focusedFileIndex = index
        const file = this.files[index]
        this.form = {
          ...this.form,
          fileName: file.fileName,
          author: file.author,
          charaName: file.charaName,
          source: file.source,
          license: file.license
        }
 
        // 实现双击复制文件名
        if (this.doubleClickTimeoutKey === 0) {
          this.doubleClickTimeoutKey = setTimeout(() => {
            this.doubleClickTimeoutKey = 0
          }, 300)
        } else {
          mw.notify('已复制文件名')
          this.copyFileName(this.form.prefix + file.fileName)
          clearTimeout(this.doubleClickTimeoutKey)
          this.doubleClickTimeoutKey = 0
        }
      },
 
      addSourceUrlFile() {
        var url = (prompt('请输入文件地址：') || '').trim()
        if (!url) { return }
        this.files.push(this.createFileItem(url))
      },
 
      copyFileName(fileName) {
        const inputTag = document.createElement('input')
        inputTag.value = fileName
        inputTag.style.cssText = `
          position: fixed;
          left: -9999px;
        `
        document.body.appendChild(inputTag)
        inputTag.focus()
        document.execCommand('selectAll')
        document.execCommand('copy')
        setTimeout(() => document.body.removeChild(inputTag), 1000)
      },
 
      asyncCurrentFileInfo() {
        if (!confirm('确定要将当前选中的文件信息(不含文件名)同步到所有文件中？')) { return }
        const currentFile = this.files[this.focusedFileIndex]
        if (!currentFile) return mw.notify('当前未选中文件')
 
        this.files.forEach(item => {
          item.author = currentFile.author
          item.charaName = currentFile.charaName
          item.source = currentFile.source
          item.license = currentFile.license
        })
 
        mw.notify('已同步')
      },
 
      showManual() {
        alert([
          '使用说明',
          '1. 该插件是一个文件上传工具，免去前往萌娘共享站再上传文件的麻烦。同时支持拖拽上传，批量上传。',
          '2. 若文件上传时发生异常，请以萌娘共享站的监视列表为准。',
          '3. 每个文件拥有独立的信息，但“分类”和“添加前缀”是共享的。在需要同步每个文件的角色名、作者等信息时可以使用“同步文件信息”的功能。',
          '4. 什么是“差分上传”：在发生文件名已存在的情况时，自动滤掉已存在的文件。通常用于在上一次批量上传中一部分失败后，再次尝试将之前没传上去的文件重新上传。',
          '5. 双击文件可以自动复制“前缀 + 文件名”。'
        ].join('\n'))
      },
 
      async submit(diffMode) {
        if (this.files.length === 0) return mw.notify('您还没有上传任何文件', { type: 'warn' })
        if (this.files.some(item => item.fileName === '')) return mw.notify('存在文件名为空的文件', { type: 'warn' })
 
        const duplicateFiles = this.files.reduce((result, item) => {
          const isDuplicate = this.files.filter(item2 => item2.fileName === item.fileName).length > 1
          isDuplicate && result.push(item)
          return result
        }, [])
        if (duplicateFiles.length > 0) return alert([
          '这些文件名发生了重复，请不要给要上传的文件设置相同的名称：',
          ...duplicateFiles.map(item => item.fileName)
        ].join('\n'))
        
        const authorizedForMoegirlFiles = this.files.filter(item => item.license === 'none:gotoCommons')
        if (authorizedForMoegirlFiles.length > 0) return alert([
          '这些文件的授权协议不允许使用上传工具，请在本次上传中删除，并前往共享站填写授权信息后上传：',
          ...authorizedForMoegirlFiles.map(item => item.fileName),
        ].join('\n'))
 
        if (!confirm('确定要开始上传吗？')) { return }
 
        let postData = this.files.map(item => {
          const metaCategories = 
            (item.charaName ? `[[分类:${item.charaName}]]` : '') + 
            (item.author ? `[[分类:作者:${item.author}]]` : '')
          const source = item.source ? `源地址:${item.source}` : ''
 
          const comment = metaCategories + source
          const pageContent = [
            '== 文件说明 ==',
            metaCategories + this.form.categories.map(item => `[[分类:${item}]]`).join(''),
            source,
            '== 授权协议 ==',
            `{{${item.license}}}`
          ].join('\n')
 
          return {
            body: item.body,
            fileName: this.form.prefix + item.fileName,
            comment,
            pageContent
          }
        })
 
        mw.notify(`开始${diffMode ? '差分' : ''}上传，共${postData.length}个文件...`)
        console.log(`---- Moegirl:fileUploader 开始${diffMode ? '差分' : ''}上传，共${postData.length}个文件 ----`)
        this.status = 2
 
        const printLogFn = (type = 'info') => msg => { mw.notify(msg, { type }); console.log(msg) }
        const printLog = printLogFn()
        printLog.warn = printLogFn('warn')
        printLog.error = printLogFn('error')
 
        try {
          const checkedResult = await checkFileNames(postData.map(item => item.fileName))
          const existedFiles = postData.filter(item => checkedResult[item.fileName.replace(/^./, s => s.toUpperCase())]) // 首字母转大写，因为checkedResult返回的文件名首字母是大写 
          if (existedFiles.length > 0 && !diffMode) {
            alert([
              '这些文件名已被使用，请为对应的文件更换其他名称：',
              ...existedFiles.map(item => item.fileName)
            ].join('\n'))
            this.status = 1
            return
          }
 
          if (diffMode) postData = postData.filter(item => !checkedResult[item.fileName.replace(/^./, s => s.toUpperCase())])
          if (diffMode && postData.length === 0) {
            alert('差分模式下没有可以上传的文件')
            this.status = 1
            return
          }
 
          printLog.warn(`${diffMode ? '差分上传' : ''}共需要上传${postData.length}个文件`)
 
          let uploadResults = []
          if (postData.length <= 3) {
            uploadResults = await Promise.all(
              postData.map(item => new Promise(resolve => {
                upload(item)
                  .then(() => {
                    printLog(`【${item.fileName}】上传成功`)
                    resolve({ fileName: item.fileName, result: true })
                  })
                  .catch(error => {
                    printLog.error(`【${item.fileName}】上传失败`)
                    resolve({ 
                      fileName: item.fileName, 
                      result: false, 
                      ...(error ? { errorInfo: error.info } : {})
                    })
                  })
              }))
            )
          } else {
            alert('上传的文件超过个三个，执行分段上传，请耐心等待。进入控制台可查看全部日志(按F12后选择Console)。')
            printLog.warn('上传文件超过3个，执行分段上传')
            
            // 分段上传
            const segmentedPostData = postData.reduce((result, item) => {
              if (result.length === 0) result.push([])
              if (result[result.length - 1].length === 3) result.push([])
              result[result.length - 1].push(item)
              return result
            }, [])
            
            console.log(segmentedPostData)
            
            for (let i=0, len=segmentedPostData.length; i < len; i++) {
              printLog(`共${len}个分段，现在开始第${i + 1}个`)
              
              const segment = segmentedPostData[i]
              const segmentedUploadResult = await Promise.all(
                segment.map(item => new Promise(resolve => {
                  upload(item)
                    .then(() => {
                      printLog(`【${item.fileName}】上传成功`)
                      resolve({ fileName: item.fileName, result: true })
                    })
                    .catch(error => {
                      printLog.error(`【${item.fileName}】上传失败`)
                      resolve({ 
                        fileName: item.fileName, 
                        result: false, 
                      	...(error ? { errorInfo: error.info } : {})
                      })
                    })
                }))
              )
 
              uploadResults.push(...segmentedUploadResult)
              printLog(`第${i + 1}个分段完成，其中${segmentedUploadResult.filter(item => item.result).length}个成功，${segmentedUploadResult.filter(item => !item.result).length}个失败`)
            }
          }
          
          const report = [
            `全部上传结果：共计${uploadResults.length}个文件，其中${uploadResults.filter(item => item.result).length}个成功，${uploadResults.filter(item => !item.result).length}个失败`,
            ...uploadResults.map((item, index) => `${index + 1}. 【${item.fileName}】${item.result ? '成功' : '失败'}`)
          ].join('\n')
 
          console.log(report)
          alert(report)
          
          const errorInfoList = uploadResults.filter(item => item.errorInfo)
          
          if (errorInfoList.length > 0) {
	          const errorInfo = '这些文件返回了错误信息：\n' + errorInfoList
	            .map(item => item.fileName + '：' + item.errorInfo)
	            .join('\n')
	            
	          console.log(errorInfo)
	          alert(errorInfo)
          }
          
          this.status = 3
        } catch (e) {
          console.log('上传流程出现错误', e)
          mw.notify('网络错误，请重试', { type: 'error' })
          this.status = 0
        }
      }
    }
  })
 
  function createStyles() {
    return jss.createStyleSheet({
      container: {
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 100
      },
 
      closeBtn: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Simsun',
        position: 'fixed',
        top: 10,
        right: 20,
        transition: 'transform 0.3s',
        zIndex: 10001,
        cursor: 'pointer',
 
        '&:hover': {
          transform: 'rotate(90deg)'
        }
      },
 
      body: {
        minWidth: 800,
        maxWidth: 930,
        height: 500,
        backgroundColor: 'white',
        borderRadius: 10,
        border: '5px #eee solid',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 'auto'
      },
 
      fileList: {
        height: '70%',
        backgroundColor: 'white',
        borderRadius: '10px 10px 0 0',
        position: 'relative',
        borderBottom: '3px #ccc solid',
        boxSizing: 'border-box',
        overflow: 'auto',
        cursor: 'pointer',
        paddingBottom: 10,
 
        '& .hintMask': {
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
 
          '&::before, &::after': {
            content: '""',
            width: 40,
            height: 150,
            backgroundColor: '#ddd',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 'auto'
          },
 
          '&::after': {
            width: 150,
            height: 40
          },
 
          '& > .hintText': {
            fontSize: 22,
            color: '#ddd',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 30,
            whiteSpace: 'nowrap'
          }
        },
 
        '& > .item': {
          width: 200,
          height: 150,
          boxSizing: 'border-box',
          backgroundColor: 'white',
          marginLeft: 10,
          marginTop: 10,
          border: '1px #ccc solid',
          display: 'inline-block',
          position: 'relative',
          cursor: 'pointer',
          verticalAlign: 'middle',
 
          '&.addFileBox': {
            '&::before, &::after': {
              content: '""',
              width: 15,
              height: 60,
              backgroundColor: '#ddd',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              margin: 'auto'
            },
 
            '&::after': {
              width: 60,
              height: 15
            }
          },
 
          '&[data-selected="true"]': {
            borderColor: '#4EBE8C',
 
            '&::after': {
              content: '""',
              display: 'block',
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              boxSizing: 'border-box',
              border: '3px #4EBE8C solid',
              pointerEvents: 'none'
            }
          },
 
          '&::before': {
            content: 'attr(data-name)',
            display: 'block',
            width: '100%',
            position: 'absolute',
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            fontSize: 13,
            textAlign: 'center',
            lineHeight: '25px',
            overflow: 'hidden',
            height: 25,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            padding: '0 10px'
          },
 
          '& > img': {
            width: '100%',
            height: '100%',
            padding: 5,
            boxSizing: 'border-box',
            objectFit: 'scale-down'
          },
 
          '& > .unablePreviewHint': {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#666',
            fontSize: 13,
 
            '& > .type': {
              width: '80%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }
          },
 
          '& > .removeBtn': {
            width: 20,
            height: 20,
            borderRadius: '50%',
            textAlign: 'center',
            lineHeight: '20px',
            fontWeight: 'bold',
            fontFamily: '黑体',
            position: 'absolute',
            top: 5,
            right: 5,
 
            '&:hover': {
              backgroundColor: '#666',
              color: 'white'
            }
          }
        }
      },
 
      panel: {
        height: '30%',
        padding: 10,
        boxSizing: 'border-box',
        display: 'flex',
 
        '& > .block': {
          display: 'flex',
          flex: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
          height: '100%',
          padding: '0 10px',
 
          '& .input-container': {
            minWidth: 240,
            position: 'relative',
 
            '& > *': {
              verticalAlign: 'middle',
              fontSize: 14,
            },
 
            '& > input': {
              boxSizing: 'border-box',
              width: 'calc(100% - 5em)',
              minWidth: 150
            }
          }
        },
 
        '& .categoryInput': {
          position: 'relative',
          
          '& .inputHint': {
            opacity: 0,
            transition: 'opacity 0.2s',
            backgroundColor: '#fffeee',
            border: '1px #ccc solid',
            padding: '2px 10px',
            position: 'absolute',
            bottom: 'calc(100% - 7px)',
            left: 'calc(100% - 7px)',
            zIndex: 1,
            borderRadius: 5,
            whiteSpace: 'nowrap'
          },
 
          '& > input:focus + .inputHint': {
            opacity: 1
          }
        },
 
        '& .categoryHints': {
          minWidth: 170,
          maxHeight: 140,
          backgroundColor: 'white',
          whiteSpace: 'nowrap',
          overflow: 'auto',
          position: 'absolute',
          right: 9,
          bottom: '100%',
          border: '1px #666 solid',
          boxSizing: 'border-box',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column-reverse',
 
          '& > .item': {
            minHeight: 20,
            lineHeight: '20px',
            boxSizing: 'border-box',
            padding: '0 5px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
 
            '&[data-selected="true"]': {
              backgroundColor: '#ccc'
            }
          }
        },
 
        '& .categories': {
          width: '100%',
          height: 23,
          border: '1px #ccc solid',
          borderRadius: 5,
          overflow: 'auto',
          marginRight: 5,
          boxSizing: 'border-box',
 
          '& > .item': {
            display: 'inline-block',
            lineHeight: '15px',
            textAlign: 'center',
            border: '1px #666 solid',
            backgroundColor: '#eee',
            margin: '2px 3px',
            padding: '0 5px',
            fontSize: 14,
            cursor: 'pointer'
          }
        },
        
        '& .buttons': {
          width: '100%',
 
          '& > button': {
            marginTop: 5
          }
        }
      }
    }).attach().classes
  }
})())
