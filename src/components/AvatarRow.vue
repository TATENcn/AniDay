<template>
  <div class="avatar-row" v-if="characters.length > 0" ref="containerRef">
    <div
      v-for="(char, index) in characters"
      :key="index"
      class="avatar-item"
      :class="{ active: currentIndex === index }"
      @click="$emit('select', index)"
    >
      <div class="img-wrapper">
        <img
          :src="char.avatar || char.image_url"
          :alt="char.name"
          @error="handleAvatarError($event, char)"
          loading="lazy"
        >
      </div>
      <div class="avatar-name">{{ char.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, nextTick, ref } from 'vue'
import type { Character } from '../composables/useCharacters'

const props = defineProps<{
  characters: Character[]
  currentIndex: number
}>()

defineEmits<{
  (e: 'select', index: number): void
}>()

const containerRef = ref<HTMLElement | null>(null)

watch(() => props.currentIndex, () => {
  nextTick(() => {
    const activeElement = containerRef.value?.querySelector('.avatar-item.active') as HTMLElement
    if (activeElement && containerRef.value) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  })
})

const handleAvatarError = (event: Event, char: Character) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/100?text=' + encodeURIComponent(char.name?.charAt(0) || '?')
}
</script>

<style scoped>
.avatar-row {
  position: absolute;
  bottom: var(--avatar-bottom-offset);
  left: 0;
  display: flex;
  gap: var(--avatar-gap);
  padding: var(--space-xl) var(--space-lg);
  margin-bottom: calc(-1 * var(--space-xl));
  overflow-x: auto;
  scrollbar-width: none;
  width: 100%;
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
  min-width: 4rem;
}

.avatar-item .img-wrapper {
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: 50%;
  border: 0.125rem solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.05);
}

.avatar-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.avatar-item .avatar-name {
  font-size: 0.75rem;
  margin-top: var(--space-sm);
  text-align: center;
  width: 100%;
  white-space: nowrap;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.avatar-item:hover .img-wrapper {
  transform: translateY(-0.25rem);
  border-color: rgba(255, 255, 255, 0.8);
}

.avatar-item.active {
  z-index: 5;
}

.avatar-item.active .img-wrapper {
  border-color: white;
  transform: scale(1.15) translateY(-0.25rem);
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.4), 0 0 1rem rgba(255, 255, 255, 0.2);
}

.avatar-item.active .avatar-name {
  opacity: 1;
  font-weight: bold;
  transform: translateY(-0.125rem);
}
</style>