<template>
  <div v-if="midiData" class="bottom-player">
    <div class="now-playing">
      <div class="vinyl-mini" :class="{ 'spinning': isPlaying }">
        <div class="vinyl-center-mini"></div>
      </div>
      <div class="track-info">
        <div class="track-name">{{ fileName.replace(/\.(mid|midi)$/, '') }}</div>
        <div class="track-time">{{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}</div>
      </div>
    </div>

    <div class="player-controls">
      <el-button @click="isPlaying ? pause() : play()" :type="isPlaying ? 'warning' : 'success'" size="large" circle
        class="play-btn">
        <el-icon v-if="isPlaying"><video-pause /></el-icon>
        <el-icon v-else><video-play /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AudioPlayer',
  props: {
    midiData: {
      type: Object,
      default: null
    },
    fileName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      volume: 50,
      audioContext: null,
      oscillators: [],
      gainNode: null,
      intervalId: null,
      startTime: 0,
      pauseTime: 0,
      audioEnabled: false
    }
  },
  watch: {
    midiData(newData) {
      if (newData) {
        this.duration = this.calculateDuration()
        this.currentTime = 0
        this.pauseTime = 0
      }
    }
  },
  async mounted() {
    await this.initAudio()
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    async initAudio() {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        this.gainNode = this.audioContext.createGain()
        this.gainNode.connect(this.audioContext.destination)
        this.setVolume()
        
        // 检查音频上下文状态
        if (this.audioContext.state === 'running') {
          this.audioEnabled = true
          console.log('音频上下文已运行')
        } else if (this.audioContext.state === 'suspended') {
          console.log('音频上下文已暂停，需要用户交互来启动')
          this.audioEnabled = false
        }
      } catch (error) {
        this.$message.error('音频初始化失败：' + error.message)
      }
    },

    calculateDuration() {
      if (!this.midiData || !this.midiData.notes || this.midiData.notes.length === 0) {
        return 30 // 默认 30 秒
      }
      
      // 找到最后一个音符的时间，加上 2 秒作为结束时间
      const lastNote = this.midiData.notes[this.midiData.notes.length - 1]
      return Math.max(lastNote.time + 2, 10) // 至少 10 秒
    },

    async play() {
      if (!this.midiData) return

      try {
        console.log('开始播放, 音频上下文状态:', this.audioContext.state)
        
        // 确保音频上下文处于运行状态（对 iOS Safari 很重要）
        if (this.audioContext.state === 'suspended') {
          console.log('尝试恢复音频上下文...')
          await this.audioContext.resume()
        }
        
        // 再次检查状态
        if (this.audioContext.state !== 'running') {
          console.error('音频上下文状态:', this.audioContext.state)
          this.$message.warning('音频需要用户交互来启动，请点击播放按钮')
          return
        }

        console.log('音频上下文运行正常, MIDI数据:', this.midiData.notes?.length || 0, '个音符')
        
        this.isPlaying = true
        this.startTime = this.audioContext.currentTime - this.pauseTime

        // 播放真正的 MIDI 数据
        this.playMidiData()
        this.startProgressTracking()
        
        this.$emit('play-state-changed', true)
      } catch (error) {
        console.error('播放失败:', error)
        this.$message.error('播放失败：' + error.message)
        this.isPlaying = false
      }
    },

    // 播放真正的 MIDI 数据
    playMidiData() {
      if (!this.midiData || !this.midiData.notes) {
        console.log('没有MIDI音符数据，播放演示')
        this.playSimpleDemo() // 如果没有音符数据，回退到演示
        return
      }

      const notes = this.midiData.notes
      const startTime = this.audioContext.currentTime
      const seekOffset = this.pauseTime

      console.log(`播放MIDI数据: ${notes.length}个音符, 起始时间: ${startTime}, 偏移: ${seekOffset}`)

      let scheduledNotes = 0
      notes.forEach(noteEvent => {
        if (!this.isPlaying) return
        
        const playTime = startTime + noteEvent.time - seekOffset
        
        if (playTime > this.audioContext.currentTime && noteEvent.type === 'noteOn') {
          this.scheduleNote(noteEvent.note, noteEvent.velocity, playTime, 0.5)
          scheduledNotes++
        }
      })
      
      console.log(`已安排播放 ${scheduledNotes} 个音符`)
    },

    // 安排播放单个音符
    scheduleNote(midiNote, velocity, startTime, duration) {
      if (!this.isPlaying) return
      
      console.log(`播放音符: ${midiNote}, 频率: ${this.midiNoteToFrequency(midiNote)}Hz, 音量: ${velocity}, 时间: ${startTime}`)
      
      const frequency = this.midiNoteToFrequency(midiNote)
      const oscillator = this.audioContext.createOscillator()
      const noteGain = this.audioContext.createGain()
      
      oscillator.connect(noteGain)
      noteGain.connect(this.gainNode)
      
      oscillator.frequency.setValueAtTime(frequency, startTime)
      oscillator.type = 'sine'
      
      // 设置音量包络
      const normalizedVelocity = velocity / 127
      const volume = normalizedVelocity * 0.3
      console.log(`音符音量: ${volume}, 主音量: ${this.volume}%`)
      
      noteGain.gain.setValueAtTime(0, startTime)
      noteGain.gain.linearRampToValueAtTime(volume, startTime + 0.01)
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
      
      this.oscillators.push(oscillator)
    },

    // MIDI 音符号转换为频率
    midiNoteToFrequency(midiNote) {
      // A4 (音符 69) = 440 Hz
      return 440 * Math.pow(2, (midiNote - 69) / 12)
    },

    // 简单的演示播放（播放一些音符）
    playSimpleDemo() {
      const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25] // C大调音阶
      let noteIndex = 0

      const playNote = () => {
        if (!this.isPlaying) return

        if (noteIndex < notes.length) {
          const frequency = notes[noteIndex]
          const oscillator = this.audioContext.createOscillator()
          const gain = this.audioContext.createGain()

          oscillator.connect(gain)
          gain.connect(this.gainNode)

          oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
          oscillator.type = 'sine'

          gain.gain.setValueAtTime(0, this.audioContext.currentTime)
          gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01)
          gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5)

          oscillator.start(this.audioContext.currentTime)
          oscillator.stop(this.audioContext.currentTime + 0.5)

          this.oscillators.push(oscillator)
          noteIndex++

          setTimeout(playNote, 600)
        } else {
          noteIndex = 0
          if (noteIndex < 32 && this.isPlaying) { // 播放 32 个音符
            setTimeout(playNote, 500)
          }
        }
      }

      playNote()
    },

    pause() {
      this.isPlaying = false
      this.pauseTime = this.audioContext.currentTime - this.startTime
      this.stopProgressTracking()
      this.stopAllOscillators()
      this.$emit('play-state-changed', false)
    },

    // 简化的停止方法（当音乐播放完毕时使用）
    stop() {
      this.isPlaying = false
      this.currentTime = 0
      this.pauseTime = 0
      this.stopProgressTracking()
      this.stopAllOscillators()
      this.$emit('play-state-changed', false)
    },

    setVolume() {
      if (this.gainNode) {
        this.gainNode.gain.setValueAtTime(this.volume / 100, this.audioContext.currentTime)
      }
    },

    startProgressTracking() {
      this.intervalId = setInterval(() => {
        if (this.isPlaying) {
          this.currentTime = this.audioContext.currentTime - this.startTime + this.pauseTime
          if (this.currentTime >= this.duration) {
            this.stop()
          }
        }
      }, 100)
    },

    stopProgressTracking() {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
    },

    stopAllOscillators() {
      this.oscillators.forEach(osc => {
        try {
          osc.stop()
        } catch (e) {
          // 忽略已经停止的振荡器
        }
      })
      this.oscillators = []
    },

    // 启用音频（用于 iOS Safari）
    async enableAudio() {
      if (!this.audioContext) {
        await this.initAudio()
      }
      
      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume()
          this.audioEnabled = true
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

    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    cleanup() {
      this.stopProgressTracking()
      this.stopAllOscillators()
      if (this.audioContext) {
        this.audioContext.close()
      }
    }
  }
}
</script>

<style scoped>
/* 底部播放器 */
.bottom-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  padding: 20px;
  border-radius: 20px 20px 0 0;
  z-index: 1000;
}

.now-playing {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.vinyl-mini {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #1a1a1a, #333);
  border-radius: 50%;
  position: relative;
  border: 2px solid #666;
  margin-right: 15px;
  transition: all 0.3s ease;
}

.vinyl-mini.spinning {
  animation: spin 3s linear infinite;
}

.vinyl-center-mini {
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.vinyl-center-mini::before {
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

.track-info {
  flex: 1;
}

.track-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.play-btn {
  width: 60px !important;
  height: 60px !important;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .bottom-player {
    padding: 15px;
  }
  
  .play-btn {
    width: 50px !important;
    height: 50px !important;
  }
}
</style>
