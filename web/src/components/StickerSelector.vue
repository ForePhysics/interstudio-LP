<template>
  <div class="sticker-selector">
    <div class="sticker-header">
      <h3>选择贴纸来发现音乐</h3>
      <div class="selected-count">已选择 {{ selectedStickers.length }} 个贴纸</div>
    </div>

    <div class="sticker-grid">
      <div v-for="sticker in stickers" :key="sticker.id" class="sticker-item"
        :class="{ selected: selectedStickers.includes(sticker.id) }" @click="toggleSticker(sticker.id)">
        <img :src="sticker.image" :alt="sticker.id" class="sticker-image" />
        <div class="sticker-name">{{ sticker.name }}</div>
      </div>
    </div>

    <div class="action-buttons">
      <el-button type="primary" :disabled="selectedStickers.length === 0" @click="findMusic" :loading="loading">
        <i class="el-icon-search"></i>
        找到匹配的音乐
      </el-button>

      <el-button v-if="selectedStickers.length > 0" @click="clearSelection">
        清空选择
      </el-button>
    </div>

    <div v-if="matchedFile" class="match-result">
      <el-alert title="找到匹配的音乐！" type="success" :description="`匹配文件: ${matchedFile}`" show-icon :closable="false" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'StickerSelector',
  emits: ['music-matched'],
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
      const index = this.selectedStickers.indexOf(stickerId)
      if (index > -1) {
        this.selectedStickers.splice(index, 1)
      } else {
        this.selectedStickers.push(stickerId)
      }
    },

    clearSelection() {
      this.selectedStickers = []
      this.matchedFile = null
    },

    async findMusic() {
      if (this.selectedStickers.length === 0) return

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
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 20px;
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

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  padding: 3px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.sticker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.sticker-item:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.sticker-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
  transform: scale(1.05);
}

.sticker-image {
  width: 50px;
  height: 50px;
  object-fit: contain;
  margin-bottom: 4px;
}

.sticker-name {
  font-size: 11px;
  text-align: center;
  color: #666;
  font-weight: 500;
}

.sticker-item.selected .sticker-name {
  color: #409eff;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.match-result {
  margin-top: 16px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sticker-selector {
    padding: 16px;
  }

  .sticker-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 10px;
  }

  .sticker-image {
    width: 40px;
    height: 40px;
  }

  .sticker-header {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
