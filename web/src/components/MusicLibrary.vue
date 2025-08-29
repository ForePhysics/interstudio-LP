<template>
  <div class="music-library">
    <!-- iOS 音频启用提示 -->
    <div v-if="!audioEnabled && needsAudioEnable" class="audio-enable-banner">
      <div class="audio-banner-content">
        <span class="audio-banner-text">🔇 点击启用音频播放</span>
        <div class="audio-banner-buttons">
          <el-button @click="playTestNote" type="info" size="small" round>测试音频</el-button>
          <el-button @click="enableAudio" type="warning" size="small" round>启用音频</el-button>
        </div>
      </div>
    </div>

    <!-- 移动端头部 -->
    <div class="mobile-header">
      <div class="header-content">
        <span class="title">🎧 音乐库</span>
        <el-button @click="loadFileList" type="primary" size="small" :loading="loadingList" round>
          <el-icon>
            <refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- MIDI 文件列表 -->
    <div class="file-list-section">
      <div v-if="fileList.length === 0 && !loadingList" class="empty-state">
        <div class="empty-icon">🎵</div>
        <p class="empty-text">暂无音乐文件</p>
        <el-button type="primary" @click="loadFileList" round>加载音乐库</el-button>
      </div>

      <div v-else-if="fileList.length > 0" class="file-list">
        <div v-for="(file, index) in fileList" :key="file.name" class="file-item"
          :class="{ 'active': selectedFile === file.url, 'playing': selectedFile === file.url && isPlaying }"
          @click="selectAndPlay(file)">
          <div class="file-avatar">
            <div class="vinyl-record" :class="{ 'spinning': selectedFile === file.url && isPlaying }">
              <div class="vinyl-center"></div>
            </div>
          </div>

          <div class="file-info">
            <div class="file-name">{{ file.name.replace(/\.(mid|midi)$/, '') }}</div>
            <div class="file-details">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-index">#{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MusicLibrary',
  props: {
    isPlaying: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fileList: [],
      selectedFile: '',
      loadingList: false,
      audioEnabled: false,
      needsAudioEnable: false,
      audioContext: null
    }
  },
  async mounted() {
    await this.checkAudioContext()
    await this.loadFileList()
  },
  methods: {
    async checkAudioContext() {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        if (this.audioContext.state === 'suspended') {
          this.needsAudioEnable = true
          this.audioEnabled = false
        } else {
          this.audioEnabled = true
        }
      } catch (error) {
        console.error('音频上下文检查失败:', error)
      }
    },

    async loadFileList() {
      this.loadingList = true
      try {
        const response = await axios.get('/api/midi-files')
        this.fileList = response.data
        if (this.fileList.length === 0) {
          this.$message.info('后端暂无 MIDI 文件')
        } else {
          this.$message.success(`找到 ${this.fileList.length} 个 MIDI 文件`)
        }
      } catch (error) {
        this.$message.error('获取文件列表失败：' + error.message)
        this.fileList = []
      } finally {
        this.loadingList = false
      }
    },

    async selectAndPlay(file) {
      if (this.selectedFile === file.url && this.isPlaying) {
        this.$emit('pause')
      } else {
        // 先停止当前播放的音乐
        if (this.isPlaying) {
          this.$emit('stop')
        }
        
        // 确保音频上下文已初始化
        if (!this.audioContext) {
          await this.checkAudioContext()
        }
        
        // iOS Safari 需要在用户交互中启动音频上下文
        if (this.audioContext.state === 'suspended') {
          try {
            await this.audioContext.resume()
            this.audioEnabled = true
            this.needsAudioEnable = false
            console.log('音频上下文已启动')
          } catch (error) {
            console.error('启动音频上下文失败:', error)
            this.$message.warning('请先点击"启用音频"按钮')
            return
          }
        }
        
        this.selectedFile = file.url
        await this.loadMidiFile(file)
      }
    },

    async loadMidiFile(file) {
      try {
        const response = await axios.get(file.url, {
          responseType: 'arraybuffer'
        })
        
        const arrayBuffer = response.data
        const midiData = this.parseMidi(arrayBuffer)
        
        this.$emit('load-midi', {
          midiData,
          fileName: file.name
        })
        
        this.$message.success('MIDI 文件加载成功')
      } catch (error) {
        this.$message.error('加载 MIDI 文件失败：' + error.message)
      }
    },

    pause() {
      this.$emit('pause')
    },

    // 解析 MIDI 文件并提取音符信息
    parseMidi(arrayBuffer) {
      const view = new DataView(arrayBuffer)
      
      // 检查 MIDI 文件头
      const header = String.fromCharCode(
        view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)
      )
      
      if (header !== 'MThd') {
        throw new Error('不是有效的 MIDI 文件')
      }

      // 解析 MIDI 头部信息
      const format = view.getUint16(8)
      const tracks = view.getUint16(10)
      const division = view.getUint16(12)

      const notes = []
      let offset = 14

      // 解析轨道
      for (let track = 0; track < tracks; track++) {
        if (offset >= arrayBuffer.byteLength - 8) break

        const trackHeader = String.fromCharCode(
          view.getUint8(offset), view.getUint8(offset + 1),
          view.getUint8(offset + 2), view.getUint8(offset + 3)
        )

        if (trackHeader === 'MTrk') {
          const trackLength = view.getUint32(offset + 4)
          offset += 8

          const trackNotes = this.parseTrackEvents(view, offset, trackLength, division)
          notes.push(...trackNotes)
          offset += trackLength
        } else {
          offset += 8
        }
      }

      return {
        format,
        tracks,
        division,
        notes: notes.sort((a, b) => a.time - b.time)
      }
    },

    parseTrackEvents(view, startOffset, trackLength, division) {
      const notes = []
      let offset = startOffset
      let deltaTime = 0
      let runningStatus = 0

      while (offset < startOffset + trackLength) {
        // 读取增量时间
        const deltaTimeResult = this.readVariableLength(view, offset)
        deltaTime += deltaTimeResult.value
        offset = deltaTimeResult.offset

        if (offset >= startOffset + trackLength) break

        // 读取事件
        let eventByte = view.getUint8(offset++)

        // 处理运行状态
        if (eventByte < 0x80) {
          // 这是一个数据字节，使用运行状态
          if (runningStatus === 0) {
            throw new Error('没有运行状态的MIDI事件')
          }
          offset-- // 回退一个字节
          eventByte = runningStatus
        } else {
          runningStatus = eventByte
        }

        const eventType = eventByte & 0xF0

        if (eventType === 0x90 || eventType === 0x80) { // Note On/Off
          if (offset + 1 >= startOffset + trackLength) break
          
          const note = view.getUint8(offset++)
          const velocity = view.getUint8(offset++)
          
          const timeInSeconds = (deltaTime / division) * 0.5 // 假设120 BPM

          // Note On 且 velocity > 0，或者 Note Off
          if ((eventType === 0x90 && velocity > 0) || eventType === 0x80) {
            notes.push({
              time: timeInSeconds,
              note: note,
              velocity: velocity,
              type: (eventType === 0x90 && velocity > 0) ? 'noteOn' : 'noteOff'
            })
          }
        } else {
          // 跳过其他事件
          const paramCount = this.getMidiEventParamCount(eventType)
          offset += paramCount
          
          if (offset >= startOffset + trackLength) break
          
          // 处理系统独占事件和元事件
          if (eventByte === 0xFF) {
            if (offset >= startOffset + trackLength) break
            // const metaType = view.getUint8(offset++) // 暂时不处理元类型
            offset++ // 跳过元类型字节
            const length = this.readVariableLength(view, offset)
            offset = length.offset + length.value
          }
        }
      }

      return notes
    },

    readVariableLength(view, offset) {
      let value = 0
      let bytesRead = 0

      while (bytesRead < 4) {
        if (offset + bytesRead >= view.byteLength) break
        
        const byte = view.getUint8(offset + bytesRead)
        value = (value << 7) | (byte & 0x7F)
        bytesRead++
        
        if ((byte & 0x80) === 0) break
      }

      return { value, offset: offset + bytesRead }
    },

    // 获取 MIDI 事件参数数量
    getMidiEventParamCount(eventType) {
      switch (eventType) {
        case 0x80: // Note Off
        case 0x90: // Note On
        case 0xA0: // Polyphonic Key Pressure
        case 0xB0: // Control Change
        case 0xE0: // Pitch Bend
          return 2
        case 0xC0: // Program Change
        case 0xD0: // Channel Pressure
          return 1
        default:
          return 0
      }
    },

    // 启用音频（用于 iOS Safari）
    async enableAudio() {
      if (!this.audioContext) {
        await this.checkAudioContext()
      }
      
      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume()
          this.audioEnabled = true
          this.needsAudioEnable = false
          console.log('音频已启用')
          
          // 播放测试音符
          this.playTestNote()
          
          this.$message.success('音频已启用，现在可以播放音乐了！')
        } catch (error) {
          console.error('启用音频失败:', error)
          this.$message.error('启用音频失败')
        }
      } else {
        this.audioEnabled = true
        this.playTestNote()
      }
    },

    // 播放测试音符
    playTestNote() {
      if (!this.audioContext || this.audioContext.state !== 'running') {
        console.log('音频上下文未运行')
        return
      }
      
      console.log('播放测试音符...')
      const oscillator = this.audioContext.createOscillator()
      const gain = this.audioContext.createGain()
      
      oscillator.connect(gain)
      gain.connect(this.audioContext.destination)
      
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime) // A4
      oscillator.type = 'sine'
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime)
      gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.5)
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    async playMatchedFile(filename) {
      // 在文件列表中查找匹配的文件
      const matchedFile = this.fileList.find(file => file.name === filename)
      
      if (matchedFile) {
        // 找到文件，直接播放
        await this.selectAndPlay(matchedFile)
        this.$message.success(`🎵 正在播放匹配的音乐: ${filename}`)
      } else {
        // 如果在当前列表中没找到，重新加载文件列表再试
        await this.loadFileList()
        
        const refreshedFile = this.fileList.find(file => file.name === filename)
        if (refreshedFile) {
          await this.selectAndPlay(refreshedFile)
          this.$message.success(`🎵 正在播放匹配的音乐: ${filename}`)
        } else {
          this.$message.error(`未找到匹配的音乐文件: ${filename}`)
        }
      }
    }
  }
}
</script>

<style scoped>
.music-library {
  background: transparent;
  padding-bottom: 200px;
  /* 为底部播放器留空间 */
}

/* 音频启用横幅 */
.audio-enable-banner {
  background: linear-gradient(45deg, #ff7b7b, #ff9a56);
  padding: 10px 20px;
  margin-bottom: 10px;
  border-radius: 10px;
  margin: 10px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.audio-banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.audio-banner-buttons {
  display: flex;
  gap: 10px;
}

.audio-banner-text {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

/* 移动端头部 */
.mobile-header {
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

/* 文件列表 */
.file-list-section {
  padding: 0 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.8);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 30px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-item {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.file-item.active {
  border-color: #409EFF;
  background: rgba(64, 158, 255, 0.2);
}

.file-item.playing {
  border-color: #67C23A;
  background: rgba(103, 194, 58, 0.2);
}

/* 黑胶唱片样式 */
.file-avatar {
  margin-right: 15px;
}

.vinyl-record {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #1a1a1a, #333);
  border-radius: 50%;
  position: relative;
  border: 2px solid #666;
  transition: all 0.3s ease;
}

.vinyl-record.spinning {
  animation: spin 3s linear infinite;
}

.vinyl-center {
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.vinyl-center::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 文件信息 */
.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-size {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.file-index {
  font-size: 12px;
  color: #409EFF;
  font-weight: 600;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .file-list-section {
    padding: 0 15px;
  }
  
  .file-item {
    padding: 12px;
  }
  
  .file-name {
    font-size: 14px;
  }
  
  .audio-enable-banner {
    margin: 10px 15px;
  }
  
  .mobile-header {
    padding: 12px 15px;
  }
}
</style>
