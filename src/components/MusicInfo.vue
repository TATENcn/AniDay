<template>
  <div class="music-info-display" v-if="title">
    <span class="music-icon">♪</span>
    <span class="music-title">{{ title }}</span>
    <span class="music-sep" v-if="artist">-</span>
    <span class="music-artist">{{ artist }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  artist?: string
}>()
</script>

<style scoped>
.music-info-display {
  position: absolute;
  bottom: var(--music-bottom-offset);
  left: 0;
  font-size: 0.85rem;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: var(--text-shadow);
  z-index: 20;
}

.music-icon {
  font-size: 1.2rem;
}

.music-title {
  font-weight: bold;
}
</style>