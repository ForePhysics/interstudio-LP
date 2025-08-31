<template>
  <div class="sticker-selector">
    <div class="sticker-header">
      <h3>选择贴纸 发现音乐</h3>
      <div class="selected-count">
        已选择 {{ selectedStickers.length }} / 6 个贴纸
        <span v-if="selectedStickers.length < 1" class="hint">(至少选择1个)</span>
        <span v-else-if="selectedStickers.length >= 6" class="hint">(已达到最大数量)</span>
      </div>
    </div>

    <div class="sticker-grid">
      <div v-for="sticker in stickers" :key="sticker.id" class="sticker-item"
        :class="{ 
          selected: selectedStickers.includes(sticker.id)
        }" 
        @click="toggleSticker(sticker.id)">
        <img :src="sticker.image" :alt="sticker.id" class="sticker-image" />
      </div>
    </div>

    <div class="action-buttons">
      <el-button 
        type="primary" 
        :disabled="selectedStickers.length === 0 || isPlaying" 
        @click="findMusic" 
        :loading="loading"
      >
        <i class="el-icon-search"></i>
        生成音乐
      </el-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'StickerSelector',
  props: {
    isPlaying: {
      type: Boolean,
      default: false
    },
    isBusy: {
      type: Boolean,
      default: false
    }
  },
  emits: ['music-matched', 'stickers-changed', 'pause-music', 'switch-to-library'],
  data() {
    return {
      selectedStickers: [],
      loading: false,
      matchedFile: null,
      stickers: [
        // Logo 系列
        { id: 'logo1', name: 'Logo 1', image: require('@/assets/sticker/logo1.webp') },
        { id: 'logo2', name: 'Logo 2', image: require('@/assets/sticker/logo2.webp') },
        { id: 'logo3', name: 'Logo 3', image: require('@/assets/sticker/logo3.webp') },
        { id: 'logo4', name: 'Logo 4', image: require('@/assets/sticker/logo4.webp') },
        { id: 'logo5', name: 'Logo 5', image: require('@/assets/sticker/logo5.webp') },
        { id: 'logo6', name: 'Logo 6', image: require('@/assets/sticker/logo6.webp') },

        // KB 系列
        { id: 'kb1', name: 'KB 1', image: require('@/assets/sticker/kb1.webp') },
        { id: 'kb2', name: 'KB 2', image: require('@/assets/sticker/kb2.webp') },
        { id: 'kb3', name: 'KB 3', image: require('@/assets/sticker/kb3.webp') },
        { id: 'kb4', name: 'KB 4', image: require('@/assets/sticker/kb4.webp') },

        // KBR 系列
        { id: 'kbr1', name: 'KBR 1', image: require('@/assets/sticker/kbr1.webp') },
        { id: 'kbr2', name: 'KBR 2', image: require('@/assets/sticker/kbr2.webp') },
        { id: 'kbr3', name: 'KBR 3', image: require('@/assets/sticker/kbr3.webp') },
        { id: 'kbr4', name: 'KBR 4', image: require('@/assets/sticker/kbr4.webp') },

        // B 系列
        { id: 'b1', name: 'B 1', image: require('@/assets/sticker/b1.webp') },
        { id: 'b2', name: 'B 2', image: require('@/assets/sticker/b2.webp') },
        { id: 'b3', name: 'B 3', image: require('@/assets/sticker/b3.webp') },
        { id: 'b4', name: 'B 4', image: require('@/assets/sticker/b4.webp') },
        { id: 'b5', name: 'B 5', image: require('@/assets/sticker/b5.webp') },
        { id: 'b6', name: 'B 6', image: require('@/assets/sticker/b6.webp') }
      ]
    }
  },
  methods: {
    toggleSticker(stickerId) {
      // 如果正在播放音乐，先暂停
      if (this.isPlaying) {
        this.$emit('pause-music')
      }

      const index = this.selectedStickers.indexOf(stickerId)
      
      if (index > -1) {
        // 如果已选中，直接移除
        this.selectedStickers.splice(index, 1)
      } else {
        // 如果未选中，检查是否已达到最大限制
        if (this.selectedStickers.length >= 6) {
          this.$message.warning('最多只能选择6个贴纸')
          return
        }
        this.selectedStickers.push(stickerId)
      }
      
      // 清除之前的匹配结果
      this.matchedFile = null
      
      // 发射贴纸变化事件
      this.$emit('stickers-changed', [...this.selectedStickers])
    },

    clearSelection() {
      this.selectedStickers = []
      this.matchedFile = null
      
      // 发射贴纸变化事件
      this.$emit('stickers-changed', [])
    },

    async findMusic() {
      if (this.selectedStickers.length === 0) return

      // 检查是否选择了 b1, b2, b3, b4, b5, b6
      const bStickers = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6']
      const selectedBStickers = this.selectedStickers.filter(sticker => bStickers.includes(sticker))
      
      if (selectedBStickers.length === 6 && this.selectedStickers.length === 6) {
        // 选择了全部6个B系列贴纸，直接播放特定音乐并跳转
        this.$emit('music-matched', {
          filename: '114,514.mp3', // 这里设置特定的音乐文件名
          stickers: this.selectedStickers,
          autoSwitchToLibrary: true
        })
        return
      }

      this.loading = true
      this.matchedFile = null

      try {
        const response = await axios.post('/api/match-stickers', {
          selectedStickers: this.selectedStickers
        })

        this.matchedFile = response.data.matchedFile

        // 通知父组件播放匹配的音乐
        this.$emit('music-matched', {
          filename: this.matchedFile,
          stickers: this.selectedStickers
        })

      } catch (error) {
        console.error('Error matching stickers:', error)
        this.$message.error('匹配音乐时出错，请重试')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.sticker-selector {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sticker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sticker-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.selected-count {
  color: #666;
  font-size: 14px;
  background: #e9ecef;
  padding: 4px 12px;
  border-radius: 16px;
}

.selected-count .hint {
  color: #999;
  font-size: 12px;
  margin-left: 8px;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  padding: 3px;
  margin-bottom: 20px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.sticker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
  background: white;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
}

.sticker-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.sticker-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}

.sticker-image {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sticker-selector {
    padding: 12px;
    height: 90%;
    display: flex;
    flex-direction: column;
  }

  .sticker-header {
    flex-direction: column;
    gap: 8px;
    text-align: center;
    flex-shrink: 0;
    margin-bottom: 16px;
  }

  .sticker-header h3 {
    font-size: 16px;
  }

  .sticker-grid {
    grid-template-columns: repeat(auto-fit, 80px);
    gap: 10px;
    justify-content: center;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    margin-bottom: 16px;
    min-height: 0;
    max-height: none;
    padding: 3px;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  .sticker-grid::-webkit-scrollbar {
    width: 6px;
  }

  .sticker-grid::-webkit-scrollbar-track {
    background: #f7fafc;
    border-radius: 3px;
  }

  .sticker-grid::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  .sticker-grid::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }

  .sticker-item {
    width: 80px;
    height: 80px;
  }

  .sticker-image {
    width: 70px;
    height: 70px;
  }

  .action-buttons {
    flex-direction: column;
    flex-shrink: 0;
    margin-top: 0;
  }
}
</style>
