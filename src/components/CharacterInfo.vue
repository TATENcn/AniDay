<template>
  <div
    v-if="character"
    class="character-info"
    :style="{ '--char-color': character.color || 'white' }"
  >
    <div class="name">{{ character.name }}</div>
    <div class="meta-info">
      <span v-if="character.cv" class="cv">CV: {{ character.cv }}</span>
      <span v-if="character.work" class="work">{{ character.work }}</span>
    </div>
    <div v-if="character.tags && character.tags.length" class="tags">
      <span v-for="tag in character.tags" :key="tag" class="tag">#{{ tag }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../composables/useCharacters'

defineProps<{
  character: Character | null
  index: number
}>()
</script>

<style scoped>
.character-info {
  position: absolute;
  bottom: var(--info-bottom-offset);
  right: 0;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 15;
}

.name {
  font-size: var(--char-name-size);
  font-weight: 500;
  text-shadow: var(--text-shadow);
  color: var(--char-color);
  transition: color 0.5s ease;
  margin-bottom: 0.125rem;
}

.meta-info {
  display: flex;
  gap: 0.9375rem;
  align-items: center;
  justify-content: flex-end;
  font-size: var(--meta-font-size);
  opacity: 0.8;
  text-shadow: var(--text-shadow);
}

.tags {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tag {
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.625rem;
  border-radius: 0.75rem;
  backdrop-filter: blur(0.3125rem);
}

@media (max-width: 48rem) {
  .meta-info {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>