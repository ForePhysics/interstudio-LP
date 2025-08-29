<template>
  <div class="vinyl-player">
    <!-- 主黑胶唱片 -->
    <div class="vinyl-container">
      <div 
        class="vinyl-record" 
        :class="{ 'spinning': isPlaying }"
        @click="togglePlay"
      >
        <!-- 黑胶唱片图片 -->
        <img 
          src="@/assets/LP.webp" 
          alt="黑胶唱片" 
          class="vinyl-image"
        />
        
        <!-- 唱针臂 -->
        <div class="tonearm" :class="{ 'playing': isPlaying }">
          <div class="tonearm-base"></div>
          <div class="tonearm-arm"></div>
          <div class="tonearm-head"></div>
        </div>
      </div>
    </div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-buttons">
        <el-button 
          type="primary" 
          circle 
          size="large"
          @click="togglePlay"
          :icon="isPlaying ? 'video-pause' : 'video-play'"
          class="main-play-button"
        >
        </el-button>
      </div>
      
      <!-- 歌曲信息 -->
      <div class="song-info" v-if="currentSongName">
        <div class="song-name">{{ currentSongName }}</div>
        <div class="song-status">
          {{ isPlaying ? '正在播放' : '已暂停' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VinylPlayer',
  props: {
    isPlaying: {
      type: Boolean,
      default: false
    },
    currentSongName: {
      type: String,
      default: ''
    }
  },
  emits: ['play', 'pause', 'stop'],
  methods: {
    togglePlay() {
      if (this.isPlaying) {
        this.$emit('pause')
      } else {
        this.$emit('play')
      }
    }
  }
}
</script>

<style scoped>
.vinyl-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 100%;
}

/* 黑胶唱片容器 */
.vinyl-container {
  position: relative;
  width: 350px;
  height: 350px;
  margin-bottom: 20px;
}

/* 黑胶唱片 */
.vinyl-record {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-origin: center;
  box-shadow: 
    0 0 0 2px #2c3e50,
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.vinyl-record:hover {
  transform: scale(1.02);
  box-shadow: 
    0 0 0 2px #e74c3c,
    0 12px 25px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.vinyl-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease;
  filter: brightness(0.9) contrast(1.1);
}

/* 旋转动画 */
.vinyl-record.spinning .vinyl-image {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 添加黑胶纹理效果 */
.vinyl-record::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: 
    repeating-conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(0, 0, 0, 0.1) 0.5deg,
      transparent 1deg
    ),
    repeating-radial-gradient(
      circle,
      transparent 0px,
      rgba(0, 0, 0, 0.05) 1px,
      transparent 2px
    );
  pointer-events: none;
  z-index: 2;
}

/* 唱针臂 */
.tonearm {
  position: absolute;
  top: 15px;
  right: 30px;
  width: 75px;
  height: 150px;
  transform-origin: 15px 15px;
  transition: transform 1.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 15;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.tonearm.playing {
  transform: rotate(28deg);
}

.tonearm-base {
  width: 26px;
  height: 26px;
  background: 
    radial-gradient(circle at 30% 30%, #bdc3c7, #95a5a6),
    linear-gradient(45deg, #7f8c8d, #95a5a6);
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 
    0 3px 10px rgba(0, 0, 0, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.3);
  border: 2px solid #2c3e50;
}

.tonearm-base::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #34495e;
  border-radius: 50%;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
}

.tonearm-arm {
  width: 4px;
  height: 110px;
  background: 
    linear-gradient(to bottom, #ecf0f1, #bdc3c7, #95a5a6);
  position: absolute;
  top: 26px;
  left: 10px;
  border-radius: 2px;
  transform-origin: top center;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset -1px 0 2px rgba(255, 255, 255, 0.3);
}

.tonearm-head {
  width: 10px;
  height: 18px;
  background: 
    linear-gradient(45deg, #e74c3c, #c0392b),
    radial-gradient(circle at 30% 30%, #ec7063, #e74c3c);
  position: absolute;
  bottom: 8px;
  left: 5px;
  border-radius: 5px 5px 2px 2px;
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  border: 1px solid #a93226;
}

.tonearm-head::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 4px;
  background: #2c3e50;
  border-radius: 50%;
}

/* 控制面板 */
.control-panel {
  width: 100%;
  max-width: 300px;
  text-align: center;
}

.control-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.main-play-button {
  width: 60px !important;
  height: 60px !important;
  font-size: 24px;
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  border: none;
  transition: all 0.3s ease;
}

.main-play-button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
}

/* 歌曲信息 */
.song-info {
  color: white;
  margin-top: 10px;
}

.song-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-status {
  font-size: 12px;
  opacity: 0.8;
  color: #bdc3c7;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .vinyl-player {
    padding: 10px 10px;
    height: 100%;
  }
  
  .vinyl-container {
    width: 280px;
    height: 280px;
    margin-bottom: 15px;
  }
  
  .tonearm {
    width: 55px;
    height: 110px;
    top: 12px;
    right: 22px;
  }
  
  .tonearm-base {
    width: 18px;
    height: 18px;
  }
  
  .tonearm-arm {
    height: 78px;
    top: 18px;
    left: 7px;
  }
  
  .main-play-button {
    width: 50px !important;
    height: 50px !important;
    font-size: 20px;
  }
  
  .song-name {
    font-size: 14px;
  }
}

/* 高级视觉效果 */
.vinyl-record::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: radial-gradient(circle, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 5;
}

.vinyl-record.spinning::before {
  opacity: 1;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
