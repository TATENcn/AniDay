<template>
  <div class="top-bar">
    <div class="top-bar-left">
    </div>

    <div class="top-bar-center">
      <div class="search-box">
        <div class="search-input-wrapper">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="搜索角色、作品或CV"
            class="search-input"
            @input="handleSearch"
            @focus="updateDropdownPosition"
          />
          <button
            v-if="searchQuery"
            class="clear-btn"
            @click="clearSearch"
            title="清空搜索"
          >
            &times;
          </button>
        </div>
        <div
          class="search-results"
          v-if="searchQuery && results.length > 0"
          ref="searchResults"
          :style="searchStyle"
        >
          <div
            v-for="(result, index) in results"
            :key="index"
            class="search-result-item"
            @click="handleSelect(result)"
          >
            <div class="result-name">{{ result.n }}</div>
            <div class="result-meta">
              <span v-if="result.w" class="result-work">{{ result.w }}</span>
              <span v-if="result.cv" class="result-cv">{{ result.cv }}</span>
              <span class="result-date">{{ result.m }}月{{ result.d }}日</span>
            </div>
          </div>
        </div>
        <div v-else-if="searchQuery" class="search-no-results" :style="searchStyle">
          未找到相关结果
        </div>
      </div>
    </div>

    <div class="top-bar-right">
      <div class="calendar-picker" :class="{ open: calendarOpen }">
        <div class="current-display" @click="toggleCalendar">
          {{ displayText }}
        </div>
        <transition name="fade-calendar">
          <div
            class="calendar-dropdown"
            v-if="calendarOpen"
            ref="calendarDropdown"
            :style="calendarStyle"
          >
            <div class="calendar-header">
              <button class="nav-btn" @click="prevMonth">&lt;</button>
              <span class="month-year">{{ calendarYear }}年{{ calendarMonth + 1 }}月</span>
              <button class="nav-btn" @click="nextMonth">&gt;</button>
              <button class="today-btn" @click="handleTodayClick">今日</button>
            </div>
            <div class="calendar-weekdays">
              <span v-for="day in weekdays" :key="day">{{ day }}</span>
            </div>
            <div class="calendar-days">
              <span
                v-for="(day, index) in calendarDays"
                :key="index"
                class="day-cell"
                :class="getDayCellClass(day)"
                @click="day && handleDayClick(day)"
              >{{ day }}</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCalendar } from '../composables/useCalendar'

interface SearchResult {
  n: string;
  w?: string;
  cv?: string;
  m: number;
  d: number;
}

const props = defineProps<{
  modelValue: string;
  displayText?: string;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', dateStr: string): void;
  (e: 'change', dateStr: string, oldDate: string): void;
  (e: 'select', month: number, day: number): void;
}>()

const calendarOpen = ref(false)
const searchQuery = ref('')
const searchIndex = ref<SearchResult[]>([])
const results = ref<SearchResult[]>([])
const searchInput = ref<HTMLInputElement | null>(null)
const calendarDropdown = ref<HTMLElement | null>(null)
const searchResults = ref<HTMLElement | null>(null)
const calendarAlign = ref<'left' | 'right'>('right')

const {
  calendarYear,
  calendarMonth,
  weekdays,
  calendarDays,
  getDayCellClass: getDayClass,
  prevMonth,
  nextMonth,
  syncToDate
} = useCalendar()

const getDayCellClass = (day: number | null) => getDayClass(day, props.modelValue)

const calendarStyle = computed(() => {
  if (calendarAlign.value === 'left') {
    return {
      left: '0',
      right: 'auto',
      transform: 'none'
    }
  }
  return {}
})

const searchStyle = computed(() => {
  return {
    left: '0',
    right: '0',
    width: 'auto'
  }
})

const updateCalendarPosition = () => {
  if (!calendarDropdown.value) return

  const rect = calendarDropdown.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth

  if (rect.right > viewportWidth) {
    calendarAlign.value = 'left'
  } else {
    calendarAlign.value = 'right'
  }
}

const updateDropdownPosition = () => {
}

const toggleCalendar = () => {
  if (!calendarOpen.value) {
    syncToDate(props.modelValue)
  }
  calendarOpen.value = !calendarOpen.value

  if (calendarOpen.value) {
    setTimeout(updateCalendarPosition, 0)
  }
}

const handleDayClick = (day: number) => {
  const oldDate = props.modelValue
  const dateStr = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  emit('update:modelValue', dateStr)
  emit('change', dateStr, oldDate)
  calendarOpen.value = false
}

const handleTodayClick = () => {
  const oldDate = props.modelValue
  const today = new Date()
  calendarYear.value = today.getFullYear()
  calendarMonth.value = today.getMonth()
  
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const dateStr = `${y}-${m}-${d}`
  
  emit('update:modelValue', dateStr)
  emit('change', dateStr, oldDate)
  calendarOpen.value = false
}

const loadSearchIndex = async () => {
  try {
    const response = await fetch('/data/search_index.json')
    if (response.ok) {
      searchIndex.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to load search index:', err)
  }
}

const handleSearch = () => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    results.value = []
    return
  }

  results.value = searchIndex.value.filter(item => {
    const nameMatch = item.n?.toLowerCase().includes(query)
    const workMatch = item.w?.toLowerCase().includes(query)
    const cvMatch = item.cv?.toLowerCase().includes(query)
    return nameMatch || workMatch || cvMatch
  }).slice(0, 10)
}

const clearSearch = () => {
  searchQuery.value = ''
  results.value = []
  searchInput.value?.focus()
}

const handleSelect = (result: SearchResult) => {
  emit('select', result.m, result.d)
  searchQuery.value = ''
  results.value = []
}

const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.top-bar')) {
    calendarOpen.value = false
    searchQuery.value = ''
    results.value = []
  }
}

onMounted(() => {
  loadSearchIndex()
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('resize', () => {
    if (calendarOpen.value) {
      updateCalendarPosition()
    }
  })
})
</script>

<style scoped>
.top-bar {
  position: absolute;
  top: var(--global-spacing);
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--content-margin-x);
  z-index: 20;
  color: white;
  box-sizing: border-box;
}

.top-bar-left {
  flex: 1;
}

.top-bar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 25rem;
  display: flex;
  justify-content: center;
  z-index: 21;
}

.top-bar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.calendar-picker {
  position: relative;
  width: var(--info-width, 18rem);
  display: flex;
  justify-content: flex-start;
}

.current-display {
  background: rgba(255, 255, 255, 0.1);
  height: var(--control-height);
  padding: 0 var(--space-md);
  display: flex;
  align-items: center;
  border-radius: var(--control-radius);
  cursor: pointer;
  border: 0.0625rem solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(0.625rem);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-sizing: border-box;
}

.current-display:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.calendar-dropdown {
  position: absolute;
  top: calc(100% + var(--global-spacing));
  left: 0;
  background: rgba(15, 15, 20, 0.95);
  backdrop-filter: blur(1.25rem);
  padding: var(--space-lg);
  border-radius: var(--panel-radius);
  border: 0.0625rem solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.5);
  min-width: 17.5rem;
  max-width: calc(100vw - 2rem);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.calendar-header .month-year {
  font-size: 1rem;
  font-weight: 500;
  order: 2;
}

.calendar-header .nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.calendar-header .nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.calendar-header .today-btn {
  background: rgba(255, 107, 157, 0.3);
  border: 0.0625rem solid rgba(255, 107, 157, 0.5);
  color: white;
  padding: var(--space-xs) var(--space-sm);
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  order: 3;
}

.calendar-header .today-btn:hover {
  background: rgba(255, 107, 157, 0.5);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.calendar-weekdays span {
  text-align: center;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  padding: var(--space-xs) 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-xs);
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.day-cell.empty {
  cursor: default;
}

.day-cell:not(.empty):hover {
  background: rgba(255, 255, 255, 0.1);
}

.day-cell.today {
  border: 0.0625rem solid rgba(255, 255, 255, 0.3);
}

.day-cell.selected {
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  font-weight: 600;
}

.day-cell.selected:hover {
  background: rgba(255, 255, 255, 0.95);
}

.day-cell.has-data::after {
  content: '';
  position: absolute;
  bottom: 0.25rem;
  width: 0.25rem;
  height: 0.25rem;
  border-radius: 50%;
  background: #ff6b9d;
}

.fade-calendar-enter-active,
.fade-calendar-leave-active {
  transition: all 0.25s ease;
}

.fade-calendar-enter-from,
.fade-calendar-leave-to {
  opacity: 0;
  transform: translateY(-0.625rem) scale(0.95);
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  height: var(--control-height);
  background: rgba(255, 255, 255, 0.1);
  border: 0.0625rem solid rgba(255, 255, 255, 0.2);
  border-radius: var(--control-radius);
  padding: 0 var(--space-md);
  padding-right: 2.5rem;
  color: white;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.clear-btn:hover {
  color: white;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.search-results {
  position: absolute;
  top: calc(100% + var(--global-spacing));
  left: 0;
  right: 0;
  background: rgba(15, 15, 20, 0.95);
  backdrop-filter: blur(1.25rem);
  border-radius: var(--panel-radius);
  border: 0.0625rem solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.5);
  padding: var(--space-md);
  max-height: 18.75rem;
  overflow-y: auto;
  box-sizing: border-box;
}

.search-result-item {
  padding: var(--space-sm) var(--space-md);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.result-name {
  font-size: 1rem;
  font-weight: 500;
  color: white;
  margin-bottom: var(--space-xs);
}

.result-meta {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.result-work,
.result-cv,
.result-date {
  display: inline-block;
}

.result-date {
  color: #ff6b9d;
}

.search-no-results {
  position: absolute;
  top: calc(100% + var(--global-spacing));
  left: 0;
  right: 0;
  background: rgba(15, 15, 20, 0.95);
  backdrop-filter: blur(1.25rem);
  border-radius: var(--panel-radius);
  border: 0.0625rem solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.5);
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  padding: var(--space-md);
  box-sizing: border-box;
}

.search-results::-webkit-scrollbar {
  width: 0.375rem;
}

.search-results::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.1875rem;
}

.search-results::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.1875rem;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 48rem) {
  .top-bar {
    padding: 0 var(--content-margin-x);
  }

  .top-bar-center {
    max-width: 50%;
  }

  .calendar-dropdown {
    min-width: 15rem;
    max-width: calc(100vw - 2rem);
  }

  .search-input {
    font-size: 0.85rem;
  }
}
</style>
