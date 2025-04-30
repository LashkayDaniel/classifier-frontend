<script setup lang="ts">
import { computed } from 'vue'

const { size = 4 } = defineProps<{
  size?: number
}>()

const customSizeClass = computed(() => `size-${size}`)
</script>

<template>
  <div class="rounded-full border-2 border-x-transparent animate-spin"
       :class="customSizeClass" />
</template>
