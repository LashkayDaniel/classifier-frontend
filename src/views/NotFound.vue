<script setup lang="ts">
import { onMounted, ref } from 'vue'

const pageLoaded = ref<boolean>(false)

onMounted(() => {
  pageLoaded.value = true
})
</script>

<template>
  <Transition name="fade-in">
    <section
      v-if="pageLoaded"
      class="relative bg-stone-400/60 border border-stone-400/30 text-center text-stone-800 p-6 mt-20 mx-auto w-[90%] sm:min-w-md sm:w-fit rounded-xl shadow-2xl overflow-hidden max-w-xl"
    >
      <div class="absolute -top-12 -left-12 size-32 bg-purple-300/30 rounded-full blur-2xl"></div>
      <div
        class="absolute -bottom-12 -right-12 size-32 bg-amber-200/30 rounded-full blur-2xl"></div>

      <h1 class="text-5xl sm:text-6xl md:text-7xl font-bold tracking-widest drop-shadow-lg">404</h1>
      <p class="mb-6 text-lg sm:text-xl font-medium">Page not found</p>

      <RouterLink
        to="/"
        class="inline-block bg-black/80 px-4 sm:px-6 py-2 text-gray-200 rounded-lg hover:bg-black transition-all duration-300 shadow-md text-sm sm:text-base"
      >
        Go Home
      </RouterLink>
    </section>
  </Transition>
</template>


<style scoped>
.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-in-enter-to,
.fade-in-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
