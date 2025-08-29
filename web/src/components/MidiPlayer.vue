<template>
  <div class="midi-player">
    <!-- 黑胶播放器主体 -->
    <div class="vinyl-main">
      <VinylPlayer 
        :is-playing="isPlaying"
        :current-song-name="currentSongDisplayName"
        @play="handleVinylPlay"
        @pause="handleVinylPause"
      />
    </div>

    <!-- 主界面切换按钮 -->
    <div class="view-switcher">
      <div class="switch-buttons">
        <el-button 
          :type="currentView === 'stickers' ? 'primary' : ''"
          @click="switchView('stickers')"
          :class="{ active: currentView === 'stickers' }"
        >
          🎨 贴纸选择
        </el-button>
        <el-button 
          :type="currentView === 'library' ? 'primary' : ''"
          @click="switchView('library')"
          :class="{ active: currentView === 'library' }"
        >
          📋 播放列表
        </el-button>
      </div>
    </div>

    <!-- 贴纸选择器视图 -->
    <div v-if="currentView === 'stickers'" class="view-panel">
      <StickerSelector @music-matched="onMusicMatched" />
    </div>
    
    <!-- 音乐库视图 -->
    <div v-if="currentView === 'library'" class="view-panel">
      <MusicLibrary 
        ref="musicLibrary"
        :is-playing="isPlaying"
        @load-midi="handleLoadMidi"
        @pause="handlePause"
      />
    </div>
    
    <!-- 隐藏的音频播放器 - 用于实际播放 -->
    <div style="display: none;">
      <AudioPlayer 
        :midi-data="midiData"
        :file-name="fileName"
        @play-state-changed="handlePlayStateChanged"
        ref="audioPlayer"
      />
    </div>
  </div>
</template>

<script>
import MusicLibrary from './MusicLibrary.vue'
import AudioPlayer from './AudioPlayer.vue'
import StickerSelector from './StickerSelector.vue'
import VinylPlayer from './VinylPlayer.vue'

export default {
  name: 'MidiPlayer',
  components: {
    MusicLibrary,
    AudioPlayer,
    StickerSelector,
    VinylPlayer
  },
  data() {
    return {
      midiData: null,
      fileName: '',
      isPlaying: false,
      currentView: 'stickers' // 默认显示贴纸选择器
    }
  },
  computed: {
    currentSongDisplayName() {
      if (!this.fileName) return ''
      // 移除文件扩展名并格式化显示
      return this.fileName.replace(/\.(mid|midi)$/, '').replace(/[,_-]/g, ' ')
    }
  },
  methods: {
    switchView(view) {
      this.currentView = view
    },
    
    handleVinylPlay() {
      if (this.midiData) {
        this.$refs.audioPlayer.play()
      } else {
        this.$message.info('请先选择一首音乐')
        this.currentView = 'stickers'
      }
    },
    
    handleVinylPause() {
      this.$refs.audioPlayer.pause()
    },
    
    handleLoadMidi(payload) {
      this.midiData = payload.midiData
      this.fileName = payload.fileName
      
      // 自动播放新加载的音乐
      this.$nextTick(() => {
        this.$refs.audioPlayer.play()
      })
    },

    handlePlayStateChanged(playing) {
      this.isPlaying = playing
    },

    handlePause() {
      this.$refs.audioPlayer.pause()
    },
    
    onMusicMatched(matchResult) {
      // 当贴纸匹配到音乐时，自动加载并播放该文件
      console.log('Music matched:', matchResult)
      
      // 先切换到播放列表视图
      this.currentView = 'library'
      
      // 在音乐库中查找并播放匹配的文件
      this.$nextTick(() => {
        if (this.$refs.musicLibrary) {
          this.$refs.musicLibrary.playMatchedFile(matchResult.filename)
        }
      })
    }
  }
}
</script>

<style scoped>
.midi-player {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 黑胶播放器主体 */
.vinyl-main {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  width: 100%;
  height: 50vh;
  background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
}

/* 视图切换器 */
.view-switcher {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(30, 60, 114, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.switch-buttons {
  display: flex;
  justify-content: center;
  padding: 15px 20px;
  gap: 12px;
}

.switch-buttons .el-button {
  min-width: 120px;
  font-size: 14px;
  border-radius: 20px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.switch-buttons .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.switch-buttons .el-button.active {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  border-color: #e74c3c;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

/* 视图面板 */
.view-panel {
  flex: 1;
  padding: 0 20px;
  animation: slideIn 0.3s ease-out;
  margin-bottom: 20px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .vinyl-main {
    padding: 10px;
  }
  
  .view-panel {
    padding: 0 10px;
  }
  
  .switch-buttons {
    padding: 12px 15px;
    gap: 8px;
  }
  
  .switch-buttons .el-button {
    min-width: 100px;
    font-size: 13px;
    padding: 8px 16px;
  }
}

/* 整体背景纹理 */
.midi-player::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.vinyl-main,
.view-switcher,
.view-panel {
  position: relative;
  z-index: 1;
}

/* 高级视觉效果 */
.view-switcher {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 平滑过渡动画 */
.switch-buttons .el-button {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.switch-buttons .el-button:not(.active):hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
}
</style>
