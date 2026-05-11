<template>
  <div
    class="birthday-app"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @wheel="handleWheel"
    @click="handleClick"
  >
    <BackgroundLayer :style="backgroundStyle" :transition-name="pageTransitionName" />

    <div class="overlay-global"></div>
    <div class="mask-top"></div>
    <div class="mask-bottom"></div>

    <transition :name="pageTransitionName" mode="out-in">
      <div class="content-wrapper" :key="selectedDate">
        <transition :name="charTransitionName" mode="out-in">
          <div class="character-content-group" :key="currentIndex">
            <QuoteDisplay
              :character="currentCharacter"
              :quotes="currentQuotes"
              :index="currentIndex"
              :loading="loading"
            />

            <CharacterInfo
              :character="currentCharacter"
              :index="currentIndex"
            />
          </div>
        </transition>

        <MusicInfo
          :title="musicMetadata.title"
          :artist="musicMetadata.artist"
        />

        <AvatarRow
          :characters="characters"
          :current-index="currentIndex"
          @select="handleCharacterSelect"
        />
      </div>
    </transition>

    <CalendarPicker
      v-model="selectedDate"
      :display-text="selectedDateDisplay"
      @change="handleDateChange"
    />

    <audio ref="audioPlayer" :src="currentMusic" autoplay loop @loadeddata="handleMusicLoaded"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BackgroundLayer from './components/BackgroundLayer.vue'
import CalendarPicker from './components/CalendarPicker.vue'
import CharacterInfo from './components/CharacterInfo.vue'
import QuoteDisplay from './components/QuoteDisplay.vue'
import AvatarRow from './components/AvatarRow.vue'
import MusicInfo from './components/MusicInfo.vue'
import { useCharacters } from './composables/useCharacters'
import { useMusic } from './composables/useMusic'
import { useBackground } from './composables/useBackground'
import { useUrlSync } from './composables/useUrlSync'
import { useCalendar } from './composables/useCalendar'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const audioPlayer = ref<HTMLAudioElement | null>(null)

const {
  characters,
  currentIndex,
  currentCharacter,
  currentQuotes,
  selectCharacter,
  setCharacters
} = useCharacters()

const { currentMusic, musicMetadata, setMusic } = useMusic()
const { getBackgroundStyle, loadDateBackground } = useBackground()
const { updateUrlParams, initFromUrl } = useUrlSync()
const { loadAvailableDates } = useCalendar()

const backgroundStyle = computed(() => {
  return getBackgroundStyle(currentCharacter.value?.bg)
})

const selectedDateDisplay = computed(() => {
  const d = new Date(selectedDate.value)
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

watch(() => currentCharacter.value?.music, (newMusic) => {
  setMusic(newMusic)
}, { immediate: true })

const handleMusicLoaded = () => {
  if (audioPlayer.value) {
    audioPlayer.value.play().catch(() => {
      const playOnce = () => {
        if (audioPlayer.value) audioPlayer.value.play()
        document.removeEventListener('click', playOnce)
      }
      document.addEventListener('click', playOnce)
    })
  }
}

const pageTransitionName = ref('page-flip-up')

const loadData = async (direction: 'up' | 'down' = 'up') => {
  pageTransitionName.value = direction === 'up' ? 'page-flip-up' : 'page-flip-down'
  loading.value = true
  const date = new Date(selectedDate.value)
  const month = date.getMonth() + 1
  const day = date.getDate()

  try {
    const dataPath = `/data/${month}/${day}.json`
    const response = await fetch(dataPath)
    if (response.ok) {
      const data = await response.json()
      setCharacters(data.characters || [])
    } else {
      setCharacters([])
    }

    await loadDateBackground(month, day)

    const { charIndex } = initFromUrl()
    if (charIndex !== undefined && charIndex < characters.value.length) {
      currentIndex.value = charIndex
    } else {
      currentIndex.value = 0
    }
  } catch (err) {
    console.error('Failed to load data:', err)
    setCharacters([])
  } finally {
    loading.value = false
  }
}

const charTransitionName = ref('char-slide-right')

const handleCharacterSelect = (index: number) => {
  charTransitionName.value = index > currentIndex.value ? 'char-slide-right' : 'char-slide-left'
  selectCharacter(index)
  updateUrlParams(selectedDate.value, index)
}

const handleDateChange = (newDate: string, oldDate: string) => {
  const direction = new Date(newDate) > new Date(oldDate) ? 'up' : 'down'
  updateUrlParams(selectedDate.value, currentIndex.value)
  loadData(direction)
}

const nextCharacter = () => {
  if (loading.value || characters.value.length <= 1) return
  const nextIndex = (currentIndex.value + 1) % characters.value.length
  handleCharacterSelect(nextIndex)
}

const prevCharacter = () => {
  if (loading.value || characters.value.length <= 1) return
  const prevIndex = (currentIndex.value - 1 + characters.value.length) % characters.value.length
  handleCharacterSelect(prevIndex)
}

const changeDate = (days: number) => {
  if (loading.value) return
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + days)
  const newDateStr = date.toISOString().split('T')[0]
  const oldDate = selectedDate.value
  selectedDate.value = newDateStr
  handleDateChange(newDateStr, oldDate)
}

const nextDate = () => changeDate(1)
const prevDate = () => changeDate(-1)

// Gesture and Edge Click Logic
const touchStart = ref({ x: 0, y: 0 })
const mouseStart = ref({ x: 0, y: 0 })
const isMouseDown = ref(false)
const lastWheelTime = ref(0)
const WHEEL_COOLDOWN = 800 // ms
const EDGE_THRESHOLD = 0.15 // 15% of screen
const MIN_SWIPE_DISTANCE = 50

const handleWheel = (e: WheelEvent) => {
  const target = e.target as HTMLElement
  if (target.closest('.avatar-row') || target.closest('.calendar-dropdown')) {
    return
  }

  const now = Date.now()
  if (now - lastWheelTime.value < WHEEL_COOLDOWN) return

  const absX = Math.abs(e.deltaX)
  const absY = Math.abs(e.deltaY)
  const threshold = 30 // Minimum delta to trigger

  if (Math.max(absX, absY) < threshold) return

  if (absX > absY) {
    // Horizontal scroll -> Character
    if (e.deltaX > 0) nextCharacter()
    else prevCharacter()
    lastWheelTime.value = now
  } else {
    // Vertical scroll -> Date
    if (e.deltaY > 0) nextDate()
    else prevDate()
    lastWheelTime.value = now
  }
}

const handleTouchStart = (e: TouchEvent) => {
  const target = e.target as HTMLElement
  if (target.closest('.avatar-row') || target.closest('.calendar-picker')) {
    touchStart.value = { x: -1, y: -1 } // Mark as invalid
    return
  }
  touchStart.value = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  if (touchStart.value.x === -1) return

  const touchEnd = {
    x: e.changedTouches[0].clientX,
    y: e.changedTouches[0].clientY
  }

  processSwipe(touchStart.value, touchEnd)
}

const handleMouseDown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.closest('.avatar-row') || target.closest('.calendar-picker')) {
    return
  }
  isMouseDown.value = true
  mouseStart.value = { x: e.clientX, y: e.clientY }
}

const handleMouseUp = (e: MouseEvent) => {
  if (!isMouseDown.value) return
  isMouseDown.value = false

  const mouseEnd = { x: e.clientX, y: e.clientY }
  const dx = mouseEnd.x - mouseStart.value.x
  const dy = mouseEnd.y - mouseStart.value.y

  // If it's a significant movement, treat it as a swipe and prevent the click event logic
  if (Math.max(Math.abs(dx), Math.abs(dy)) > MIN_SWIPE_DISTANCE) {
    processSwipe(mouseStart.value, mouseEnd)
  } else {
    // If it's a small movement, let the handleClick handle it
    // But we need to be careful not to trigger both
  }
}

const processSwipe = (start: { x: number, y: number }, end: { x: number, y: number }) => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const absX = Math.abs(dx)
  const absY = Math.abs(dy)

  if (Math.max(absX, absY) > MIN_SWIPE_DISTANCE) {
    if (absX > absY) {
      // Horizontal swipe
      if (dx > 0) prevCharacter()
      else nextCharacter()
    } else {
      // Vertical swipe
      if (dy > 0) prevDate()
      else nextDate()
    }
  }
}

const handleClick = (e: MouseEvent) => {
  // Prevent edge clicks if clicking on interactive elements
  const target = e.target as HTMLElement
  if (target.closest('.avatar-row') || target.closest('.calendar-picker') || target.closest('audio')) {
    return
  }

  // If the mouse moved significantly between mousedown and mouseup, don't trigger edge click
  if (mouseStart.value.x !== 0 || mouseStart.value.y !== 0) {
    const dx = Math.abs(e.clientX - mouseStart.value.x)
    const dy = Math.abs(e.clientY - mouseStart.value.y)
    if (Math.max(dx, dy) > 10) return // Threshold for click vs drag
  }

  const { innerWidth, innerHeight } = window
  const x = e.clientX
  const y = e.clientY

  const distL = x
  const distR = innerWidth - x
  const distT = y
  const distB = innerHeight - y

  const minDist = Math.min(distL, distR, distT, distB)
  const threshold = Math.min(innerWidth, innerHeight) * EDGE_THRESHOLD

  if (minDist > threshold) return

  if (minDist === distL) {
    prevCharacter()
  } else if (minDist === distR) {
    nextCharacter()
  } else if (minDist === distT) {
    prevDate()
  } else if (minDist === distB) {
    nextDate()
  }
}

onMounted(() => {
  const { date, charIndex } = initFromUrl()
  if (date) {
    selectedDate.value = date
  }
  if (charIndex !== undefined) {
    currentIndex.value = charIndex
  }

  loadAvailableDates()
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
  --text-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.8);
  --content-margin-x: 15%;
  --content-width: 70%;
  --quote-font-size: 2.8rem;
  --quote-mark-size: 3.5rem;
  --quote-max-width: 65%;
  --char-name-size: 2.2rem;
  --meta-font-size: 1.1rem;
  --info-bottom-offset: 13.75rem;
  --music-bottom-offset: 10rem;
  --avatar-bottom-offset: 3.75rem;
  --avatar-size: 3.75rem;
  --avatar-gap: 0.9375rem;
  --picker-top: 1.875rem;
  --picker-right: 5%;
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
  margin-left: var(--content-margin-x);
  width: var(--content-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.character-content-group {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  top: 0;
}

@media (max-width: 64rem) {
  :root {
    --content-margin-x: 8%;
    --content-width: 84%;
    --quote-font-size: 2.2rem;
    --quote-mark-size: 2.8rem;
    --char-name-size: 1.8rem;
    --meta-font-size: 1rem;
    --info-bottom-offset: 12.5rem;
    --music-bottom-offset: 9.0625rem;
    --avatar-size: 3.125rem;
    --avatar-gap: 0.75rem;
  }
}

@media (max-width: 48rem) {
  :root {
    --content-margin-x: 5%;
    --content-width: 90%;
    --quote-font-size: 1.6rem;
    --quote-mark-size: 2rem;
    --quote-max-width: 100%;
    --char-name-size: 1.4rem;
    --meta-font-size: 0.9rem;
    --info-bottom-offset: 11.25rem;
    --music-bottom-offset: 8.125rem;
    --avatar-bottom-offset: 3.125rem;
    --avatar-size: 2.8125rem;
    --avatar-gap: 0.625rem;
    --picker-top: 0.9375rem;
    --picker-right: 3%;
  }
}

/* Original zoom transition (unused now, but kept for reference) */
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

/* Global Page flip transitions */
.page-flip-up-enter-active,
.page-flip-up-leave-active,
.page-flip-down-enter-active,
.page-flip-down-leave-active,
.char-slide-right-enter-active,
.char-slide-right-leave-active,
.char-slide-left-enter-active,
.char-slide-left-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-flip-up-enter-from {
  opacity: 0;
  transform: translateY(3.125rem);
}

.page-flip-up-leave-to {
  opacity: 0;
  transform: translateY(-3.125rem);
}

.page-flip-down-enter-from {
  opacity: 0;
  transform: translateY(-3.125rem);
}

.page-flip-down-leave-to {
  opacity: 0;
  transform: translateY(3.125rem);
}

/* Character Slide transitions */
.char-slide-right-enter-from {
  opacity: 0;
  transform: translateX(3.125rem);
}

.char-slide-right-leave-to {
  opacity: 0;
  transform: translateX(-3.125rem);
}

.char-slide-left-enter-from {
  opacity: 0;
  transform: translateX(-3.125rem);
}

.char-slide-left-leave-to {
  opacity: 0;
  transform: translateX(3.125rem);
}
</style>