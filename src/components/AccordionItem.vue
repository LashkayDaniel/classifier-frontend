<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string,
}>()

const showContent = ref<boolean>(false)

const toggleShow = () => {
  showContent.value = !showContent.value
}

</script>

<template>
  <div class="p-2 bg-stone-400/50 m-2 backdrop-blur-md">
    <div
      class="flex justify-between border-stone-400 p-2 sm:p-4 hover:bg-stone-400/20 transition-all duration-400 hover:rounded-lg cursor-pointer"
      :class="{'border-b':showContent}"
      @click.prevent="toggleShow">
      <h2 class="font-semibold text-stone-700 text-sm sm:text-base">{{ title }}</h2>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
           stroke="currentColor" class="size-6 stroke-stone-500"
           :class="{'rotate-180': showContent}">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </div>

    <Transition
      name="expand"
      enter-active-class="transition-all duration-500 ease-in-out"
      leave-active-class="transition-all duration-500 ease-in-out"
    >
      <div v-show="showContent" class="overflow-hidden">
        <div class="py-4">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scaleY(0);
  transform-origin: top;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: scaleY(1);
  transform-origin: top;
}
</style>
