<template>
  <div class="midi-player">
    <!-- 贴纸选择器 -->
    <StickerSelector @music-matched="onMusicMatched" />
    
    <!-- 音乐库组件 -->
    <MusicLibrary 
      ref="musicLibrary"
      :is-playing="isPlaying"
      @load-midi="handleLoadMidi"
      @pause="handlePause"
    />
    
    <!-- 音频播放器组件 -->
    <AudioPlayer 
      :midi-data="midiData"
      :file-name="fileName"
      @play-state-changed="handlePlayStateChanged"
      ref="audioPlayer"
    />
  </div>
</template>

<script>
import MusicLibrary from './MusicLibrary.vue'
import AudioPlayer from './AudioPlayer.vue'
import StickerSelector from './StickerSelector.vue'

export default {
  name: 'MidiPlayer',
  components: {
    MusicLibrary,
    AudioPlayer,
    StickerSelector
  },
  data() {
    return {
      midiData: null,
      fileName: '',
      isPlaying: false
    }
  },
  methods: {
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
      
      // 在音乐库中查找并播放匹配的文件
      if (this.$refs.musicLibrary) {
        this.$refs.musicLibrary.playMatchedFile(matchResult.filename)
      }
    }
  }
}
</script>

<style scoped>
.midi-player {
  background: transparent;
  min-height: 100vh;
}
</style>
