<template>
  <template v-if="character">
    <div
      class="quote-container"
      :style="{ '--char-color': character.color || 'white' }"
    >
      <div class="quote-text-group">
        <div v-for="(quote, idx) in quotes" :key="idx" class="quote-text-item">
          <span class="quote-mark">「</span>
          {{ quote }}
          <span class="quote-mark">」</span>
        </div>
      </div>
    </div>
  </template>

  <div v-else-if="!loading" class="no-data">
    <div class="quote-text">{{ emptyText }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../composables/useCharacters'

interface Props {
  character: Character | null
  quotes: string[]
  index: number
  loading: boolean
  emptyText?: string
}

withDefaults(defineProps<Props>(), {
  character: null,
  quotes: () => ['生日快乐'],
  index: 0,
  loading: false,
  emptyText: '今天没有发现过生日的角色呢...'
})
</script>

<style scoped>
.quote-container {
  max-width: var(--quote-max-width);
  margin-bottom: var(--space-3xl);
  overflow-y: auto;
  max-height: 50vh;
  scrollbar-width: none;
}

.quote-container::-webkit-scrollbar {
  display: none;
}

.quote-text-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.quote-text-item {
  font-family: 'LXGWNeoZhiSong', serif;
  font-size: var(--quote-font-size);
  font-weight: 300;
  line-height: 1.5;
  text-shadow: var(--text-shadow);
  text-align: left;
}

.quote-mark {
  font-family: 'LXGWNeoZhiSong', serif;
  font-size: var(--quote-mark-size);
  opacity: 0.8;
}

.no-data .quote-text {
  font-family: 'LXGWNeoZhiSong', serif;
  font-size: var(--quote-font-size);
  font-weight: 300;
  line-height: 1.5;
  text-shadow: var(--text-shadow);
}
</style>