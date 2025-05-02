<script setup lang="ts">
import ToastIcon from '@/components/icons/ToastIcon.vue'
import type { IToastItem } from '@/types/IToastItem.ts'
import { computed } from 'vue'

const { toast } = defineProps<{
  toast: IToastItem
}>()

const emit = defineEmits<(e: 'close', id: number) => void>()

const colorClasses = computed(() => {
  switch (toast.type) {
    case 'success':
      return {
        base: 'bg-green-500/20 border-green-500',
        title: 'text-green-700',
        text: 'text-green-700/80'
      }
    case 'warning':
      return {
        base: 'bg-yellow-500/20 border-yellow-600',
        title: 'text-yellow-700',
        text: 'text-yellow-700'
      }
    case 'error':
      return {
        base: 'bg-red-500/20 border-red-500',
        title: 'text-red-700',
        text: 'text-red-700/80'
      }
    case 'info':
      return {
        base: 'bg-sky-500/20 border-sky-500',
        title: 'text-sky-700',
        text: 'text-sky-600'
      }
    default:
      return 'amber'
  }
})
</script>

<template>
  <li class="border rounded p-2 w-70" :class="colorClasses.base">
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <ToastIcon :type="toast.type" />
        <h3 :class="colorClasses.title" class="font-semibold">{{ toast.title }}</h3>
      </div>
      <button @click="emit('close', toast.id)"
              title="close"
              class="hover:bg-gray-400/20 rounded-lg p-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
             class="size-4 stroke-gray-500">
          <path fill-rule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <p :class="colorClasses.text" class="text-sm ml-7 hyphens-auto">
      {{ toast.message
      }}</p>
  </li>
</template>
