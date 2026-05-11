import { ref, computed } from 'vue'

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

export function useCalendar() {
  const calendarYear = ref(new Date().getFullYear())
  const calendarMonth = ref(new Date().getMonth())
  const availableDates = ref<Set<string>>(new Set())

  const calendarDays = computed(() => {
    const year = calendarYear.value
    const month = calendarMonth.value
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  })

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() &&
      calendarMonth.value === today.getMonth() &&
      calendarYear.value === today.getFullYear()
  }

  const isSelected = (day: number | null, selectedDate: string) => {
    if (!day) return false
    const [y, m, d] = selectedDate.split('-').map(Number)
    return day === d && calendarMonth.value === (m - 1) && calendarYear.value === y
  }

  const hasCharacterData = (day: number | null) => {
    if (!day) return false
    const dateStr = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return availableDates.value.has(dateStr)
  }

  const getDayCellClass = (day: number | null, selectedDate: string) => {
    if (!day) return { empty: true }
    return {
      empty: false,
      today: isToday(day),
      selected: isSelected(day, selectedDate),
      'has-data': hasCharacterData(day)
    }
  }

  const prevMonth = () => {
    if (calendarMonth.value === 0) {
      calendarMonth.value = 11
      calendarYear.value--
    } else {
      calendarMonth.value--
    }
  }

  const nextMonth = () => {
    if (calendarMonth.value === 11) {
      calendarMonth.value = 0
      calendarYear.value++
    } else {
      calendarMonth.value++
    }
  }

  const syncToDate = (dateStr: string) => {
    const [y, m] = dateStr.split('-').map(Number)
    calendarYear.value = y
    calendarMonth.value = m - 1
  }

  const goToToday = () => {
    const today = new Date()
    calendarYear.value = today.getFullYear()
    calendarMonth.value = today.getMonth()
  }

  const loadAvailableDates = async () => {
    try {
      const response = await fetch('/data/search_index.json')
      if (response.ok) {
        const data = await response.json()
        availableDates.value = new Set(data.map((c: any) => `${c.m}-${c.d}`))
      }
    } catch (e) {
      console.log('Failed to load available dates')
    }
  }

  return {
    calendarYear,
    calendarMonth,
    weekdays,
    calendarDays,
    isToday,
    isSelected,
    hasCharacterData,
    getDayCellClass,
    prevMonth,
    nextMonth,
    syncToDate,
    goToToday,
    loadAvailableDates
  }
}
