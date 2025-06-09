<script setup lang="ts">
import { useToastStore } from '@/stores/toast.ts'
import ToastItem from '@/components/toast/ToastItem.vue'

const toastStore = useToastStore()

function closeHandler(id: number) {
  toastStore.remove(id)
}
</script>

<template>
  <div
    class="fixed left-2 bottom-2 sm:left-auto sm:right-5 sm:bottom-5 z-100 overflow-hidden">
    <TransitionGroup name="list" tag="ul" class="flex flex-col gap-y-2">
      <ToastItem
        v-for="toast in toastStore.toastQueue"
        :key="toast.id"
        :toast="toast"
        @close="closeHandler"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-enter-active {
  transition: all 0.1s ease-in;
}

.list-leave-active {
  transition: all 0.3s ease-in;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px) translateX(15px);
}
</style>
