<template>
  <div id="app">
    <div class="mobile-header">
      <h1>🎵 科道书院迎新唱片</h1>
    </div>
    <Mp3Player />
  </div>
</template>

<script>
import Mp3Player from './components/Mp3Player.vue'

export default {
  name: 'App',
  components: {
    Mp3Player
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
  --header-height: 38px;
}

.mobile-header {
  padding: 5px 15px;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-header h1 {
  font-size: 24px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mobile-header .subtitle {
  font-size: 14px;
  opacity: 0.8;
  font-weight: 300;
}

/* 移动端适配 */
@media (max-width: 768px) {
  #app {
    --header-height: 28px;
  }
  
  .mobile-header {
    padding: 5px 8px;
  }
  
  .mobile-header h1 {
    font-size: 18px;
  }
  
  .mobile-header .subtitle {
    font-size: 12px;
  }
}
</style>
