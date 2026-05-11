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
  bottom: calc(var(--music-bottom-offset) + 0.5rem);
  left: var(--space-lg);
  font-size: 0.85rem;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
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