import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IToastItem } from '@/types/IToastItem.ts'

type NewToastItem = Omit<IToastItem, 'id'>
export const useToastStore = defineStore('toast', () => {
  const toastQueue = ref<IToastItem[]>([])

  function add(newItem: NewToastItem) {
    const id: number = new Date().getTime()
    toastQueue.value.push({ ...newItem, id })
    if (newItem.durationShow !== undefined) {
      setTimeout(() => {
        remove(id)
      }, newItem.durationShow * 1000)
    }
  }

  function remove(id: number) {
    toastQueue.value = toastQueue.value.filter(t => t.id !== id)
  }

  return { toastQueue, add, remove }
})
