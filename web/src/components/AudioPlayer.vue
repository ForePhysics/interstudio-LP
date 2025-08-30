<template>
  <div v-if="mp3Data" class="bottom-player">
    <div class="now-playing">
      <div class="vinyl-mini" :class="{ 'spinning': isPlaying }">
        <div class="vinyl-center-mini"></div>
      </div>
      <div class="track-info">
        <div class="track-name">{{ fileName.replace(/\.mp3$/, '') }}</div>
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
    mp3Data: {
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
      audioElement: null,
      audioEnabled: false
    }
  },
  watch: {
    mp3Data(newData) {
      if (newData) {
        this.loadMp3()
      }
    }
  },
  mounted() {
    this.initAudio()
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    initAudio() {
      this.audioElement = new Audio()
      this.audioElement.volume = this.volume / 100
      
      // 监听音频事件
      this.audioElement.addEventListener('loadedmetadata', () => {
        this.duration = this.audioElement.duration
      })
      
      this.audioElement.addEventListener('timeupdate', () => {
        this.currentTime = this.audioElement.currentTime
      })
      
      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false
        this.currentTime = 0
        this.$emit('play-state-changed', false)
      })
      
      this.audioElement.addEventListener('error', (e) => {
        console.error('音频播放错误:', e)
        this.$message.error('音频播放失败')
        this.isPlaying = false
        this.$emit('play-state-changed', false)
      })
    },

    loadMp3() {
      if (this.mp3Data && this.mp3Data.url) {
        this.audioElement.src = this.mp3Data.url
        this.currentTime = 0
      }
    },

    async play() {
      if (!this.mp3Data || !this.audioElement) return

      try {
        await this.audioElement.play()
        this.isPlaying = true
        this.$emit('play-state-changed', true)
      } catch (error) {
        console.error('播放失败:', error)
        this.$message.error('播放失败：' + error.message)
        this.isPlaying = false
      }
    },

    pause() {
      if (this.audioElement) {
        this.audioElement.pause()
        this.isPlaying = false
        this.$emit('play-state-changed', false)
      }
    },

    stop() {
      if (this.audioElement) {
        this.audioElement.pause()
        this.audioElement.currentTime = 0
        this.isPlaying = false
        this.currentTime = 0
        this.$emit('play-state-changed', false)
      }
    },

    setVolume() {
      if (this.audioElement) {
        this.audioElement.volume = this.volume / 100
      }
    },

    formatDuration(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    cleanup() {
      if (this.audioElement) {
        this.audioElement.pause()
        this.audioElement = null
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
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.95), rgba(42, 82, 152, 0.95));
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.play-btn:active {
  transform: scale(0.95);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .bottom-player {
    padding: 10px 15px;
  }
  
  .track-name {
    font-size: 14px;
  }
  
  .track-time {
    font-size: 11px;
  }
  
  .play-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>