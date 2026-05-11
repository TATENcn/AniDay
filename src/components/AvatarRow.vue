<template>
  <div class="avatar-row" v-if="characters.length > 0">
    <div
      v-for="(char, index) in characters"
      :key="index"
      class="avatar-item"
      :class="{ active: currentIndex === index }"
      @click="$emit('select', index)"
    >
      <img
        :src="char.avatar || char.image_url"
        :alt="char.name"
        @error="handleAvatarError($event, char)"
      >
      <div class="avatar-name">{{ char.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../composables/useCharacters'

defineProps<{
  characters: Character[]
  currentIndex: number
}>()

defineEmits<{
  (e: 'select', index: number): void
}>()

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
  padding: 1.875rem 1.25rem;
  margin-bottom: -1.25rem;
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
  min-width: 4.375rem;
}

.avatar-item img {
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: 50%;
  border: 0.125rem solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
  transition: all 0.3s;
}

.avatar-item .avatar-name {
  font-size: 0.75rem;
  margin-top: 0.5rem;
  text-align: center;
  width: 100%;
  white-space: nowrap;
}

.avatar-item:hover img {
  transform: scale(1.05);
  border-color: white;
}

.avatar-item.active {
  z-index: 5;
}

.avatar-item.active img {
  border-color: white;
  transform: scale(1.1);
  box-shadow: 0 0 1.25rem rgba(255, 255, 255, 0.4);
}

.avatar-item.active .avatar-name {
  font-weight: bold;
}
</style>