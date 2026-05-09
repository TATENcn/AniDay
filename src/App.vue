<template>
  <div class="birthday-app">
    <!-- Dedicated Background Layer with Transition -->
    <transition name="bg-zoom" mode="out-in">
      <div
          class="background-layer"
          :key="backgroundStyle.backgroundImage"
          :style="backgroundStyle"
      ></div>
    </transition>

    <!-- Overlays -->
    <div class="overlay-global"></div>
    <div class="mask-top"></div>
    <div class="mask-bottom"></div>

    <!-- Main Content Wrapper (Restricted to 20% - 80%) -->
    <div class="content-wrapper">
      <!-- Quote Area (Left) -->
      <template v-if="currentCharacter">
        <transition name="slide-left" mode="out-in">
          <div class="quote-container" :key="currentIndex" :style="{ '--char-color': currentCharacter.color || 'white' }">
            <div class="quote-text-group">
              <div v-for="(quote, index) in currentQuotes" :key="index" class="quote-text-item">
                <span class="quote-mark">"</span>
                {{ quote }}
                <span class="quote-mark">"</span>
              </div>
            </div>
          </div>
        </transition>
      </template>

      <div v-else-if="!loading" class="no-data">
        <div class="quote-text">今天没有发现过生日的角色呢...</div>
      </div>

      <!-- Character Info (Bottom Right - Above Avatars) -->
      <transition name="slide-right" mode="out-in">
        <div class="character-info-bottom-right" v-if="currentCharacter" :key="currentIndex" :style="{ '--char-color': currentCharacter.color || 'white' }">
          <div class="name">{{ currentCharacter.name }}</div>
          <div class="meta-info">
            <span v-if="currentCharacter.cv" class="cv">CV: {{ currentCharacter.cv }}</span>
            <span v-if="currentCharacter.work" class="work">{{ currentCharacter.work }}</span>
          </div>
          <div v-if="currentCharacter.tags && currentCharacter.tags.length" class="tags">
            <span v-for="tag in currentCharacter.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
        </div>
      </transition>

      <!-- Music Info -->
      <div class="music-info-display" v-if="musicMetadata.title">
        <span class="music-icon">♪</span>
        <span class="music-title">{{ musicMetadata.title }}</span>
        <span class="music-sep" v-if="musicMetadata.artist">-</span>
        <span class="music-artist">{{ musicMetadata.artist }}</span>
      </div>

      <!-- Bottom Avatar Row -->
      <div class="avatar-row" v-if="characters.length > 0">
        <div
            v-for="(char, index) in characters"
            :key="index"
            class="avatar-item"
            :class="{ active: currentIndex === index }"
            @click="selectCharacter(index)"
        >
          <img :src="char.avatar || char.image_url" :alt="char.name" @error="handleAvatarError($event, char)">
          <div class="avatar-name">{{ char.name }}</div>
        </div>
      </div>
    </div>

    <!-- Date Picker (Floating/Minimal) -->
    <div class="date-picker-mini" :class="{ open: isDatePickerOpen }">
      <div class="current-display" @click="isDatePickerOpen = !isDatePickerOpen">
        {{ selectedDateDisplay }}
      </div>
      <div class="picker-content" v-if="isDatePickerOpen">
        <input type="date" v-model="selectedDate" @change="handleDateChange">
        <button @click="showToday">今日</button>
      </div>
    </div>

    <!-- Audio Player -->
    <audio ref="audioPlayer" :src="currentMusic" autoplay loop @loadeddata="handleMusicLoaded"></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import jsmediatags from 'jsmediatags'

// Constants & Defaults
const DEFAULT_BG = '/background/49831005.png'
const DEFAULT_MUSIC = '/music/02. 潮鳴り.flac'
const DEFAULT_QUOTE = '生日快乐'

// State
const selectedDate = ref(new Date().toISOString().split('T')[0])
const characters = ref([])
const currentIndex = ref(0)
const loading = ref(false)
const isDatePickerOpen = ref(false)
const dateBgUrl = ref('')
const audioPlayer = ref(null)
const musicMetadata = ref({ title: '', artist: '' })

// Computed
const currentCharacter = computed(() => characters.value[currentIndex.value] || null)

const currentQuotes = computed(() => {
  if (!currentCharacter.value) return [DEFAULT_QUOTE]
  const quotes = currentCharacter.value.quotes || []
  if (quotes.length === 0) return [DEFAULT_QUOTE]
  return quotes
})

const currentMusic = computed(() => {
  if (currentCharacter.value?.music) return currentCharacter.value.music
  return DEFAULT_MUSIC
})

const fetchMusicMetadata = async (url) => {
  musicMetadata.value = { title: url.split('/').pop().split('.')[0], artist: '加载中...' }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Network response was not ok')
    const blob = await response.blob()
    const file = new File([blob], url.split('/').pop(), { type: blob.type })

    jsmediatags.read(file, {
      onSuccess: (tag) => {
        musicMetadata.value = {
          title: tag.tags.title || url.split('/').pop().split('.')[0],
          artist: tag.tags.artist || '未知艺术家'
        }
      },
      onError: (error) => {
        console.log('Error reading tags: ', error.type, error.info)
        musicMetadata.value = {
          title: url.split('/').pop().split('.')[0],
          artist: ''
        }
      }
    })
  } catch (error) {
    console.log('Error fetching music for metadata:', error)
    musicMetadata.value = {
      title: url.split('/').pop().split('.')[0],
      artist: ''
    }
  }
}

watch(currentMusic, (newUrl) => {
  if (newUrl) fetchMusicMetadata(newUrl)
}, { immediate: true })

const backgroundStyle = computed(() => {
  let url = DEFAULT_BG

  if (currentCharacter.value && currentCharacter.value.bg) {
    url = currentCharacter.value.bg
  } else if (dateBgUrl.value) {
    url = dateBgUrl.value
  } else {
    url = DEFAULT_BG
  }

  const formattedUrl = url.startsWith('http') || url.startsWith('/') ? url : `/${url}`
  console.log('Final computed background URL:', formattedUrl)

  return {
    backgroundImage: `url('${formattedUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

const selectedDateDisplay = computed(() => {
  const d = new Date(selectedDate.value)
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

// Methods
const handleMusicLoaded = () => {
  if (audioPlayer.value) {
    audioPlayer.value.play().catch(() => {
      console.log('Autoplay blocked, waiting for interaction')
      const playOnce = () => {
        audioPlayer.value.play()
        document.removeEventListener('click', playOnce)
      }
      document.addEventListener('click', playOnce)
    })
  }
}

const selectCharacter = (index) => {
  currentIndex.value = index
}

const handleAvatarError = (event, char) => {
  event.target.src = 'https://via.placeholder.com/100?text=' + encodeURIComponent(char.name?.charAt(0) || '?')
}

const checkFileExists = async (url) => {
  try {
    const formattedUrl = url.startsWith('/') ? url : `/${url}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const response = await fetch(formattedUrl, {
      method: 'HEAD',
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) return false
    const contentType = response.headers.get('Content-Type')
    return contentType && contentType.startsWith('image/')
  } catch (e) {
    return false
  }
}

const loadData = async () => {
  console.log('Starting to load data for:', selectedDate.value)
  loading.value = true
  const date = new Date(selectedDate.value)
  const month = date.getMonth() + 1
  const day = date.getDate()

  try {
    const dataPath = `/data/${month}/${day}.json`
    console.log('Fetching character data from:', dataPath)
    const response = await fetch(dataPath)
    if (response.ok) {
      const data = await response.json()
      console.log('Loaded character data:', data)
      characters.value = data.characters || []
    } else {
      console.warn('Character data not found (404)')
      characters.value = []
    }

    const bgRes = await fetch('/data/background.json')
    dateBgUrl.value = ''
    if (bgRes.ok) {
      const bgData = await bgRes.json()
      if (bgData[month] && bgData[month][day] && bgData[month][day].url) {
        dateBgUrl.value = bgData[month][day].url
      }
    }

    if (!dateBgUrl.value) {
      const extensions = ['jpg', 'png', 'webp', 'jpeg']
      for (const ext of extensions) {
        const url = `/background/${month}-${day}.${ext}`
        if (await checkFileExists(url)) {
          dateBgUrl.value = url
          break
        }
      }
    }

    currentIndex.value = 0
  } catch (err) {
    console.error('Failed to load data:', err)
    characters.value = []
  } finally {
    loading.value = false
    console.log('Data loading finished')
  }
}

const handleDateChange = () => {
  isDatePickerOpen.value = false
  loadData()
}

const showToday = () => {
  selectedDate.value = new Date().toISOString().split('T')[0]
  handleDateChange()
}

onMounted(() => {
  loadData()
})
</script>

<style>
@font-face {
  font-family: 'LXGWNeoXiHei';
  src: url('./assets/fonts/LXGWNeoXiHei.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'LXGWNeoZhiSong';
  src: url('./assets/fonts/LXGWNeoZhiSong.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'LXGWWenKaiMonoGBScreen';
  src: url('./assets/fonts/LXGWWenKaiMonoGBScreen.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

:root {
  --primary-color: #ffffff;
  --accent-color: #ffffff;
  --text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
}

body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: black;
}

.birthday-app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #000;
  font-family: 'LXGWNeoXiHei', system-ui, sans-serif;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.overlay-global {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
  pointer-events: none;
}

.mask-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 15vh;
  background: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  z-index: 2;
}

.mask-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 25vh;
  background: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  z-index: 2;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  margin-left: 15%;
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.quote-container {
  max-width: 65%;
  margin-bottom: 15vh;
  animation: fadeIn 1.5s ease-out;
  overflow-y: auto;
  max-height: 60vh;
  scrollbar-width: none;
}

.quote-container::-webkit-scrollbar {
  display: none;
}

.quote-text-group {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 名言专用字体 */
.quote-text-item {
  font-family: 'LXGWNeoZhiSong', serif;
  font-size: 2.8rem;
  font-weight: 300;
  line-height: 1.5;
  text-shadow: var(--text-shadow);
  text-align: left;
}

.quote-mark {
  font-family: 'LXGWNeoZhiSong', serif;
  font-size: 3.5rem;
  opacity: 0.8;
}

.character-info-bottom-right {
  position: absolute;
  bottom: 220px;
  right: 0;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  animation: fadeInRight 1.5s ease-out;
  z-index: 15;
}

.character-info-bottom-right .name {
  font-size: 2.2rem;
  font-weight: 500;
  text-shadow: var(--text-shadow);
  color: var(--char-color);
  transition: color 0.5s ease;
  margin-bottom: 0.2rem;
}

.meta-info {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: flex-end;
  font-size: 1.1rem;
  opacity: 0.8;
  text-shadow: var(--text-shadow);
}

.tags {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tag {
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 10px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.music-info-display {
  position: absolute;
  bottom: 160px;
  left: 0;
  font-size: 0.85rem;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: var(--text-shadow);
  z-index: 20;
}

.music-icon {
  font-size: 1.2rem;
}

.music-title {
  font-weight: bold;
}

.avatar-row {
  position: absolute;
  bottom: 60px;
  left: 0;
  display: flex;
  gap: 15px;
  padding: 10px 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.avatar-row::-webkit-scrollbar {
  display: none;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  transition: transform 0.3s ease;
  min-width: 70px;
}

.avatar-item img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
  transition: all 0.3s;
}

.avatar-item .avatar-name {
  font-size: 0.75rem;
  margin-top: 8px;
  text-align: center;
  width: 100%;
  white-space: nowrap;
}

.avatar-item:hover img {
  transform: scale(1.05);
  border-color: white;
}

.avatar-item.active img {
  border-color: white;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

.avatar-item.active .avatar-name {
  font-weight: bold;
}

.date-picker-mini {
  position: absolute;
  top: 30px;
  right: 5%;
  z-index: 20;
  color: white;
}

.current-display {
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 15px;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  font-size: 0.9rem;
}

.picker-content {
  position: absolute;
  top: 110%;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  padding: 15px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.bg-zoom-enter-active,
.bg-zoom-leave-active {
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.bg-zoom-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.bg-zoom-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.8s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.8s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-quote-enter-active,
.fade-quote-leave-active {
  transition: all 0.8s ease;
}

.fade-quote-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-quote-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1024px) {
  .content-wrapper {
    margin-left: 10%;
    width: 80%;
  }
}

@media (max-width: 768px) {
  .quote-text-item {
    font-size: 1.8rem;
  }
  .character-info-bottom-right .name {
    font-size: 1.5rem;
  }
}
</style>