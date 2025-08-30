<template>
  <div class="vinyl-player">
    <!-- 背景贴纸区域 - 圆形环绕布局 -->
    <div class="sticker-zones">
      <!-- 贴纸按顺时针方向环绕：上(12点)、右上(2点)、右下(4点)、下(6点)、左下(8点)、左上(10点) -->
      <div class="sticker-zone zone-1" :class="{ 'has-sticker': stickerZones[0] }" style="--position: 0;">
        <img v-if="stickerZones[0]" :src="getStickerImage(stickerZones[0])" :alt="stickerZones[0]"
          class="zone-sticker" />
      </div>
      <div class="sticker-zone zone-2" :class="{ 'has-sticker': stickerZones[1] }" style="--position: 1;">
        <img v-if="stickerZones[1]" :src="getStickerImage(stickerZones[1])" :alt="stickerZones[1]"
          class="zone-sticker" />
      </div>
      <div class="sticker-zone zone-3" :class="{ 'has-sticker': stickerZones[2] }" style="--position: 2;">
        <img v-if="stickerZones[2]" :src="getStickerImage(stickerZones[2])" :alt="stickerZones[2]"
          class="zone-sticker" />
      </div>
      <div class="sticker-zone zone-4" :class="{ 'has-sticker': stickerZones[3] }" style="--position: 3;">
        <img v-if="stickerZones[3]" :src="getStickerImage(stickerZones[3])" :alt="stickerZones[3]"
          class="zone-sticker" />
      </div>
      <div class="sticker-zone zone-5" :class="{ 'has-sticker': stickerZones[4] }" style="--position: 4;">
        <img v-if="stickerZones[4]" :src="getStickerImage(stickerZones[4])" :alt="stickerZones[4]"
          class="zone-sticker" />
      </div>
      <div class="sticker-zone zone-6" :class="{ 'has-sticker': stickerZones[5] }" style="--position: 5;">
        <img v-if="stickerZones[5]" :src="getStickerImage(stickerZones[5])" :alt="stickerZones[5]"
          class="zone-sticker" />
      </div>
    </div>

    <!-- 主黑胶唱片 -->
    <div class="vinyl-container">
      <div class="vinyl-record" :class="{ 'spinning': isPlaying }" @click="togglePlay">
        <!-- 黑胶唱片图片 -->
        <img src="@/assets/LP.webp" alt="黑胶唱片" class="vinyl-image" />
      </div>
    </div>

    <!-- 独立的唱针臂 -->
    <div class="tonearm" :class="{ 'playing': isPlaying }">
      <div class="tonearm-base"></div>
      <div class="tonearm-arm"></div>
      <div class="tonearm-head"></div>
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
    selectedStickers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['play', 'pause', 'stop'],
  data() {
    return {
      stickerZones: [null, null, null, null, null, null], // 6个区域
      stickerData: {
        // Logo 系列
        logo1: require('@/assets/sticker/logo1.webp'),
        logo2: require('@/assets/sticker/logo2.webp'),
        logo3: require('@/assets/sticker/logo3.webp'),
        logo4: require('@/assets/sticker/logo4.webp'),
        logo5: require('@/assets/sticker/logo5.webp'),
        logo6: require('@/assets/sticker/logo6.webp'),
        // Keyboard 系列
        kb1: require('@/assets/sticker/kb1.webp'),
        kb2: require('@/assets/sticker/kb2.webp'),
        kb3: require('@/assets/sticker/kb3.webp'),
        kb4: require('@/assets/sticker/kb4.webp'),
        // Keyboard RGB 系列
        kbr1: require('@/assets/sticker/kbr1.webp'),
        kbr2: require('@/assets/sticker/kbr2.webp'),
        kbr3: require('@/assets/sticker/kbr3.webp'),
        kbr4: require('@/assets/sticker/kbr4.webp'),
        // Background 系列
        b1: require('@/assets/sticker/b1.webp'),
        b2: require('@/assets/sticker/b2.webp'),
        b3: require('@/assets/sticker/b3.webp'),
        b4: require('@/assets/sticker/b4.webp'),
        b5: require('@/assets/sticker/b5.webp'),
        b6: require('@/assets/sticker/b6.webp')
      }
    }
  },
  watch: {
    selectedStickers: {
      handler(newStickers) {
        this.updateStickerZones(newStickers)
      },
      immediate: true
    }
  },
  methods: {
    togglePlay() {
      if (this.isPlaying) {
        this.$emit('pause')
      } else {
        this.$emit('play')
      }
    },

    getStickerImage(stickerId) {
      return this.stickerData[stickerId] || ''
    },

    updateStickerZones(selectedStickers) {
      // 重置所有区域
      this.stickerZones = [null, null, null, null, null, null]

      // 按选择顺序填充区域，顺序为顺时针：1(上), 2(右上), 3(右下), 4(下), 5(左下), 6(左上)
      selectedStickers.forEach((sticker, index) => {
        if (index < 6) {
          this.stickerZones[index] = sticker
        }
      })
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
  padding: 50px;
  background:
    radial-gradient(circle at center, #34495e 0%, #2c3e50 70%, #1a252f 100%),
    conic-gradient(from 0deg, #2c3e50, #34495e, #2c3e50);
  border-radius: 50%;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 0 0 8px rgba(255, 255, 255, 0.1),
    inset 0 0 0 12px rgba(0, 0, 0, 0.2);
  width: 600px;
  height: 600px;
  position: relative;
}

/* 贴纸区域容器 - 圆形环绕布局 */
.sticker-zones {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 550px;
  height: 550px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.sticker-zone {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  /* 使用CSS变量计算位置，每个贴纸相隔60度 */
  --angle: calc(var(--position) * 60deg);
  --radius: 230px;
  
  top: 50%;
  left: 50%;
  transform: 
    translate(-50%, -50%)
    rotate(var(--angle))
    translateY(calc(-1 * var(--radius)))
    rotate(calc(-1 * var(--angle)));
}

.sticker-zone.has-sticker {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(64, 158, 255, 0.8);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  /* 保持原有transform，不添加scale */
  transform: 
    translate(-50%, -50%)
    rotate(var(--angle))
    translateY(calc(-1 * var(--radius)))
    rotate(calc(-1 * var(--angle)));
}

.zone-sticker {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 10px;
  animation: stickerAppear 0.5s ease-out;
}

@keyframes stickerAppear {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }

  50% {
    transform: scale(1.1) rotate(5deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

/* 黑胶唱片容器 */
.vinyl-container {
  position: relative;
  width: 70%;
  aspect-ratio: 1;
  z-index: 10;
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
    repeating-conic-gradient(from 0deg,
      transparent 0deg,
      rgba(0, 0, 0, 0.1) 0.5deg,
      transparent 1deg),
    repeating-radial-gradient(circle,
      transparent 0px,
      rgba(0, 0, 0, 0.05) 1px,
      transparent 2px);
  pointer-events: none;
  z-index: 2;
}

/* 唱针臂 - 独立定位 */
.tonearm {
  transform: rotate(-80deg);
  position: absolute;
  top: 52%;
  right: 150px;
  margin-top: -190px;
  width: 75px;
  height: 150px;
  transform-origin: 50% 13px;
  transition: transform 1.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 15;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.tonearm.playing {
  transform: rotate(-12deg);
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
  left: 50%;
  transform: translateX(-50%);
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
  left: 50%;
  transform: translateX(-50%);
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
  left: 50%;
  transform: translateX(-50%);
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

/* 移动端适配 */
@media (max-width: 768px) {
  .vinyl-player {
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    padding: 8%;
    max-width: none;
    max-height: none;
  }

  .sticker-zones {
    width: 100%;
    height: 100%;
  }

  .sticker-zone {
    width: 15%;
    height: 15%;
    --radius: 250%;
  }

  .zone-sticker {
    width: 80%;
    height: 80%;
  }

  .vinyl-container {
    width: 70%;
  }

  .tonearm {
    width: 14%;
    height: 28%;
    top: 30%;
    right: 28%;
    margin-top: -55px;
    transform-origin: 50% 9px;
  }

  .tonearm-base {
    width: 18px;
    height: 18px;
    left: 50%;
    transform: translateX(-50%);
  }

  .tonearm-arm {
    height: 78px;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
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
  background: radial-gradient(circle, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%);
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
