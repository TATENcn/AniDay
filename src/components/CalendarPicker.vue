<template>
  <div class="calendar-picker" :class="{ open: localOpen }">
    <div class="current-display" @click="toggle">
      {{ displayText }}
    </div>
    <transition name="fade-calendar">
      <div class="calendar-dropdown" v-if="localOpen">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCalendar } from '../composables/useCalendar'

const props = defineProps<{
  modelValue: string
  displayText?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', dateStr: string): void
  (e: 'change', dateStr: string, oldDate: string): void
}>()

const localOpen = ref(false)

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

const toggle = () => {
  if (!localOpen.value) {
    syncToDate(props.modelValue)
  }
  localOpen.value = !localOpen.value
}

const handleDayClick = (day: number) => {
  const oldDate = props.modelValue
  const dateStr = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  emit('update:modelValue', dateStr)
  emit('change', dateStr, oldDate)
  localOpen.value = false
}

const handleTodayClick = () => {
  const oldDate = props.modelValue
  const today = new Date()
  calendarYear.value = today.getFullYear()
  calendarMonth.value = today.getMonth()
  const dateStr = today.toISOString().split('T')[0]
  emit('update:modelValue', dateStr)
  emit('change', dateStr, oldDate)
  localOpen.value = false
}
</script>

<style scoped>
.calendar-picker {
  position: absolute;
  top: var(--picker-top);
  right: var(--picker-right);
  z-index: 20;
  color: white;
}

.current-display {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.375rem 0.9375rem;
  border-radius: 1.25rem;
  cursor: pointer;
  border: 0.0625rem solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(0.625rem);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.current-display:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.calendar-dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  background: rgba(15, 15, 20, 0.95);
  backdrop-filter: blur(1.25rem);
  padding: 1.25rem;
  border-radius: 1rem;
  border: 0.0625rem solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.5);
  min-width: 17.5rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9375rem;
  flex-wrap: wrap;
  gap: 0.625rem;
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
  padding: 0.25rem 0.625rem;
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
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.calendar-weekdays span {
  text-align: center;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.25rem 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
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
</style>