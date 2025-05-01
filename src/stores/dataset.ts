import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useDatasetStore = defineStore('dataset', () => {
  const uploaded = ref<boolean>(false)

  const isUploaded = computed(() => uploaded.value)

  watch(uploaded, () => {
    localStorage.setItem('datasetUploaded', JSON.stringify(uploaded.value))
  })

  function loadFromStorage() {
    const value = localStorage.getItem('datasetUploaded')
    if (value !== null) {
      uploaded.value = JSON.parse(value)
    }
  }

  loadFromStorage()

  function set(): void {
    uploaded.value = true
  }

  function reset(): void {
    uploaded.value = false
  }

  return { isUploaded, set, reset }
})
