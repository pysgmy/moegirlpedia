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
  
  // ?????????????????????????????????
  $('#p-cactions ul').append('<li id="btn-fileUploader"><a title="????????????">????????????</a></li>')
  $('#btn-fileUploader').click(() => {
  	alert('?????????????????????????????????????????????????????????')
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
      <div :class="s.closeBtn" @click="hideWidget">??</div>
      
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
            <div class="hintText">?????????????????????????????????????????????</div>
          </div>
 
          <div 
            v-for="(item, index) in files" 
            :key="item.body.lastModified" 
            class="item"
            :data-name="item.fileName"
            :data-selected="index === focusedFileIndex"
            title="??????????????????????????????????????????"
            @click="focusFile(index)"
          >
            <img 
              v-if="isImageFile(item.body)"
              :src="item.objectUrl" 
            />
            <div v-else class="unablePreviewHint">
              <div>??????????????????????????????</div>
              <div 
                v-if="typeof item.body !== 'string'" 
                class="type"
              >Mimetype: {{ item.body.type }}</div>
            </div>
            <div class="removeBtn" @click.stop="files.splice(index, 1)">??</div>
          </div>
 
          <div
            v-if="files.length !== 0"
            class="item addFileBox"
            @click="$refs.fileInput.click()"
          />
        </div>
 
        <div :class="s.panel">
          <div class="block">
            <div class="input-container" title="?????????????????????????????????????????????????????????????????????">
              <span>????????????</span>
              <input v-model.trim="form.fileName" />
            </div>
 
            <div class="input-container categoryInput" title="????????????????????????">
              <span>????????????</span>
              <input 
                ref="categoryInput"
                v-model.trim="form.categoryInput" 
                @input="loadCategoryHint" 
                @keydown.enter="addCategory(form.categoryInput)"
                @keydown.up.prevent="handlerFor_categoryInput_wasKeyDowned"
                @focus="categoryFocused = true"
                @blur="categoryFocused = false"
              />
              <div class="inputHint">????????????????????????</div>
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
                title="??????????????????"
                @click="form.categories.splice(index, 1)"
              >{{ item }}</div>
            </div>
          </div>
          
          <div class="block">
            <div class="input-container">
              <span>????????????</span>
              <input v-model.trim="form.charaName" />
            </div>
            
            <div class="input-container">
              <span>????????????</span>
              <input v-model.trim="form.author" />
            </div>
 
            <div class="input-container">
              <span>????????????</span>
              <input v-model.trim="form.source" />
            </div>
          </div>
 
          <div 
            class="block"
            style="flex-direction:column; justify-content:space-around; align-items:flex-start;"
          >
            <div class="input-container" title="????????????????????????">
              <span>???????????????</span>
              <input v-model.trim="form.prefix" style="width:calc(100% - 6em)" />
            </div>
 
            <div 
              class="input-container" 
              style="justify-content:flex-start;"
            >
              <select v-model.trim="form.license">
	            <option disabled="disabled" value="">??????????????????(????????????????????????????????????)</option>
            	<optgroup label="CC??????">
                  <option value="CC Zero" title="???????????????????????????????????????">CC-0</option>
                  <option value="CC BY" title="??????????????????????????????????????????????????????3.0??????">CC BY 3.0</option>
                  <option value="CC BY-SA" title="?????????????????????-?????????????????????????????????????????????3.0??????">CC BY-SA 3.0</option>
                  <option value="CC BY-NC-SA" title="?????????????????????-???????????????-?????????????????????????????????????????????3.0??????">CC BY-NC-SA 3.0</option>
            	</optgroup>
                <optgroup label="????????????">
                  <option value="PD-Old">?????????????????????????????????????????????</option>
                  <option value="PD-Other">??????????????????????????????</option>
                </optgroup>
    			<optgroup label="??????">
    			  <option value="Copyright" title="????????????????????????????????????">?????????????????????</option>
                  <option value="none:gotoCommons">???????????????????????????</option>
                  <option value="???????????????" title="??????????????????????????????????????????">???????????????</option>
                  <option value="????????????????????????">????????????????????????</option>
    			</optgroup>
              </select>
            </div>
 
            <div class="buttons">
              <button @click="addSourceUrlFile">?????????????????????</button>
              <button :disabled="status === 2" title="??????????????????" @click="submit(false)">??????</button>
              <button 
                :disabled="status === 2" 
                title="?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????" 
                @click="submit(true)"
              >????????????</button>
              <button title="?????????????????????????????????????????????????????????" @click="asyncCurrentFileInfo">??????????????????</button>
              <button @click="showManual">????????????</button>
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
        s: createStyles(), // ??????
        allowedFileTypes: ['ogg', 'ogv', 'oga', 'flac', 'opus', 'wav', 'webm', 'mp3', 'png', 'gif', 'jpg', 'jpeg', 'webp', 'svg', 'pdf', 'ppt', 'jp2', 'doc', 'docx', 'xls', 'xlsx', 'psd', 'sai', 'swf', 'mp4'],
 
        files: [], // ??????????????????
        focusedFileIndex: 0,
        categoryHints: [],
        categoryInputDebounceTimeoutKey: 0,
        categoryHintFocusedIndex: -1,
        categoryFocused: false,
        status: 1, // 0????????????1???????????????2???????????????3?????????
        form: {
          fileName: '',
          categoryInput: '', // ???????????????
          categories: [], // ????????????????????????
          charaName: '',
          author: '',
          source: '',
          prefix: '',
          license: ''
        },
        doubleClickTimeoutKey: 0  // ??????????????????????????? 
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
          alert('?????????????????????????????????????????????????????????????????????')
          window.open('https://commons.moegirl.org.cn/Special:????????????', '_blank')
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
        if (this.form.categories.includes(categoryName)) return mw.notify('???????????????????????????') 
        this.form.categories.push(categoryName)
        this.resetCategory()
      },
 
      // ?????????????????????????????????
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
          
          if (file.size / 1024 / 1024 > 20) return alert(`?????????${file.name}???????????????20m??????????????????`)
          this.files.push(this.createFileItem(file))
        })
 
        e.target.value = ''
        if (this.files.length === 50) mw.notify('??????????????????50?????????', { type: 'wran' })
      },
 
      addFileByDropping(e) {
        const originalFileList = e.dataTransfer.files
        ;[].forEach.call(originalFileList, file => {
          if (this.files.length === 50) { return }
          
          if (!this.allowedFileTypes.includes(file.name.replace(/.+\.(.+?)$/, '$1'))) return alert(`???${file.name}??????????????????????????????????????????`) 
          if (file.size / 1024 / 1024 > 20) return alert(`???${file.name}??????????????????20m??????????????????`)
          this.files.push(this.createFileItem(file))
        })
 
        if (this.files.length === 50) mw.notify('??????????????????50?????????', { type: 'wran' })
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
 
        // ???????????????????????????
        if (this.doubleClickTimeoutKey === 0) {
          this.doubleClickTimeoutKey = setTimeout(() => {
            this.doubleClickTimeoutKey = 0
          }, 300)
        } else {
          mw.notify('??????????????????')
          this.copyFileName(this.form.prefix + file.fileName)
          clearTimeout(this.doubleClickTimeoutKey)
          this.doubleClickTimeoutKey = 0
        }
      },
 
      addSourceUrlFile() {
        var url = (prompt('????????????????????????') || '').trim()
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
        if (!confirm('???????????????????????????????????????(???????????????)???????????????????????????')) { return }
        const currentFile = this.files[this.focusedFileIndex]
        if (!currentFile) return mw.notify('?????????????????????')
 
        this.files.forEach(item => {
          item.author = currentFile.author
          item.charaName = currentFile.charaName
          item.source = currentFile.source
          item.license = currentFile.license
        })
 
        mw.notify('?????????')
      },
 
      showManual() {
        alert([
          '????????????',
          '1. ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
          '2. ??????????????????????????????????????????????????????????????????????????????',
          '3. ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
          '4. ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
          '5. ??????????????????????????????????????? + ???????????????'
        ].join('\n'))
      },
 
      async submit(diffMode) {
        if (this.files.length === 0) return mw.notify('??????????????????????????????', { type: 'warn' })
        if (this.files.some(item => item.fileName === '')) return mw.notify('??????????????????????????????', { type: 'warn' })
 
        const duplicateFiles = this.files.reduce((result, item) => {
          const isDuplicate = this.files.filter(item2 => item2.fileName === item.fileName).length > 1
          isDuplicate && result.push(item)
          return result
        }, [])
        if (duplicateFiles.length > 0) return alert([
          '???????????????????????????????????????????????????????????????????????????????????????',
          ...duplicateFiles.map(item => item.fileName)
        ].join('\n'))
        
        const authorizedForMoegirlFiles = this.files.filter(item => item.license === 'none:gotoCommons')
        if (authorizedForMoegirlFiles.length > 0) return alert([
          '???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
          ...authorizedForMoegirlFiles.map(item => item.fileName),
        ].join('\n'))
 
        if (!confirm('???????????????????????????')) { return }
 
        let postData = this.files.map(item => {
          const metaCategories = 
            (item.charaName ? `[[??????:${item.charaName}]]` : '') + 
            (item.author ? `[[??????:??????:${item.author}]]` : '')
          const source = item.source ? `?????????:${item.source}` : ''
 
          const comment = metaCategories + source
          const pageContent = [
            '== ???????????? ==',
            metaCategories + this.form.categories.map(item => `[[??????:${item}]]`).join(''),
            source,
            '== ???????????? ==',
            `{{${item.license}}}`
          ].join('\n')
 
          return {
            body: item.body,
            fileName: this.form.prefix + item.fileName,
            comment,
            pageContent
          }
        })
 
        mw.notify(`??????${diffMode ? '??????' : ''}????????????${postData.length}?????????...`)
        console.log(`---- Moegirl:fileUploader ??????${diffMode ? '??????' : ''}????????????${postData.length}????????? ----`)
        this.status = 2
 
        const printLogFn = (type = 'info') => msg => { mw.notify(msg, { type }); console.log(msg) }
        const printLog = printLogFn()
        printLog.warn = printLogFn('warn')
        printLog.error = printLogFn('error')
 
        try {
          const checkedResult = await checkFileNames(postData.map(item => item.fileName))
          const existedFiles = postData.filter(item => checkedResult[item.fileName.replace(/^./, s => s.toUpperCase())]) // ???????????????????????????checkedResult???????????????????????????????????? 
          if (existedFiles.length > 0 && !diffMode) {
            alert([
              '????????????????????????????????????????????????????????????????????????',
              ...existedFiles.map(item => item.fileName)
            ].join('\n'))
            this.status = 1
            return
          }
 
          if (diffMode) postData = postData.filter(item => !checkedResult[item.fileName.replace(/^./, s => s.toUpperCase())])
          if (diffMode && postData.length === 0) {
            alert('??????????????????????????????????????????')
            this.status = 1
            return
          }
 
          printLog.warn(`${diffMode ? '????????????' : ''}???????????????${postData.length}?????????`)
 
          let uploadResults = []
          if (postData.length <= 3) {
            uploadResults = await Promise.all(
              postData.map(item => new Promise(resolve => {
                upload(item)
                  .then(() => {
                    printLog(`???${item.fileName}???????????????`)
                    resolve({ fileName: item.fileName, result: true })
                  })
                  .catch(error => {
                    printLog.error(`???${item.fileName}???????????????`)
                    resolve({ 
                      fileName: item.fileName, 
                      result: false, 
                      ...(error ? { errorInfo: error.info } : {})
                    })
                  })
              }))
            )
          } else {
            alert('????????????????????????????????????????????????????????????????????????????????????????????????????????????(???F12?????????Console)???')
            printLog.warn('??????????????????3????????????????????????')
            
            // ????????????
            const segmentedPostData = postData.reduce((result, item) => {
              if (result.length === 0) result.push([])
              if (result[result.length - 1].length === 3) result.push([])
              result[result.length - 1].push(item)
              return result
            }, [])
            
            console.log(segmentedPostData)
            
            for (let i=0, len=segmentedPostData.length; i < len; i++) {
              printLog(`???${len}???????????????????????????${i + 1}???`)
              
              const segment = segmentedPostData[i]
              const segmentedUploadResult = await Promise.all(
                segment.map(item => new Promise(resolve => {
                  upload(item)
                    .then(() => {
                      printLog(`???${item.fileName}???????????????`)
                      resolve({ fileName: item.fileName, result: true })
                    })
                    .catch(error => {
                      printLog.error(`???${item.fileName}???????????????`)
                      resolve({ 
                        fileName: item.fileName, 
                        result: false, 
                      	...(error ? { errorInfo: error.info } : {})
                      })
                    })
                }))
              )
 
              uploadResults.push(...segmentedUploadResult)
              printLog(`???${i + 1}????????????????????????${segmentedUploadResult.filter(item => item.result).length}????????????${segmentedUploadResult.filter(item => !item.result).length}?????????`)
            }
          }
          
          const report = [
            `???????????????????????????${uploadResults.length}??????????????????${uploadResults.filter(item => item.result).length}????????????${uploadResults.filter(item => !item.result).length}?????????`,
            ...uploadResults.map((item, index) => `${index + 1}. ???${item.fileName}???${item.result ? '??????' : '??????'}`)
          ].join('\n')
 
          console.log(report)
          alert(report)
          
          const errorInfoList = uploadResults.filter(item => item.errorInfo)
          
          if (errorInfoList.length > 0) {
	          const errorInfo = '????????????????????????????????????\n' + errorInfoList
	            .map(item => item.fileName + '???' + item.errorInfo)
	            .join('\n')
	            
	          console.log(errorInfo)
	          alert(errorInfo)
          }
          
          this.status = 3
        } catch (e) {
          console.log('????????????????????????', e)
          mw.notify('????????????????????????', { type: 'error' })
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
            fontFamily: '??????',
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
