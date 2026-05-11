<template>
  <transition :name="transitionName" mode="out-in">
    <div
      class="background-layer"
      :key="style.backgroundImage"
      :style="style"
    ></div>
  </transition>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'

defineProps<{
  style: CSSProperties
  transitionName?: string
}>()
</script>

<style scoped>
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

/* Original zoom transition */
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

/* Page flip UP (next day) */
.page-flip-up-enter-active,
.page-flip-up-leave-active,
.page-flip-down-enter-active,
.page-flip-down-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-flip-up-enter-from {
  opacity: 0;
  transform: translateY(2rem);
}

.page-flip-up-leave-to {
  opacity: 0;
  transform: translateY(-2rem);
}

/* Page flip DOWN (previous day) */
.page-flip-down-enter-from {
  opacity: 0;
  transform: translateY(-2rem);
}

.page-flip-down-leave-to {
  opacity: 0;
  transform: translateY(2rem);
}
</style>