<template>
  <div id="app">
    <div class="mobile-header">
      <h1>🎵 InterStudio 黑胶唱片</h1>
    </div>
    <MidiPlayer />
  </div>
</template>

<script>
import MidiPlayer from './components/MidiPlayer.vue'

export default {
  name: 'App',
  components: {
    MidiPlayer
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #fff;
  overflow-x: hidden;
}

.mobile-header {
  padding: 20px 15px 10px;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.mobile-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mobile-header .subtitle {
  font-size: 14px;
  opacity: 0.8;
  font-weight: 300;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-header {
    padding: 15px 10px 8px;
  }
  
  .mobile-header h1 {
    font-size: 20px;
  }
  
  .mobile-header .subtitle {
    font-size: 12px;
  }
}
</style>
