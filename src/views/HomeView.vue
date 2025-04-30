<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import router from '@/router'
import axios from 'axios'
import SuccessIcon from '@/components/icons/SuccessIcon.vue'
import BtnClassify from '@/components/buttons/BtnClassify.vue'
import DisplayAnimation from '@/components/animations/DisplayAnimation.vue'
import DatasetIcon from '@/components/icons/DatasetIcon.vue'

const isPageVisible = ref<boolean>(false)
const file = ref<File | null>(null)
const uploadDatasetLoading = ref<boolean>(false)


const isFileUploaded = computed(() => !!file.value)
const fileUploadClass = computed(() =>
  isFileUploaded.value
    ? 'bg-green-500/10 border-green-600/30'
    : 'bg-zinc-200 border-zinc-400'
)

const handleFileUpload = (event: Event) => {
  event.preventDefault()
  let uploadedFile: File | null = null
  if (event instanceof DragEvent && event.dataTransfer?.files.length) {
    uploadedFile = event.dataTransfer.files[0]
  }
  if (event.target instanceof HTMLInputElement && event.target.files?.length) {
    uploadedFile = event.target.files[0]
  }

  if (!uploadedFile) return

  const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase()
  if (!['csv'].includes(fileExtension || '')) {
    alert('Only .csv files are supported')
    return
  }

  file.value = uploadedFile
}

async function uploadDatasetHandler() {
  uploadDatasetLoading.value = true

  if (!file.value) {
    console.log('File is not selected')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file.value)
    const response = await axios.post('http://localhost:8080/api/v1/upload-dataset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    console.log('The file was sent successfully:', response.data)
  } catch (error) {
    console.error('Error sending a file:', error)
    alert(error?.response.data.error)
    return
  } finally {
    uploadDatasetLoading.value = false
  }

  await router.push({ name: 'classify' })
}

onMounted(() => {
  isPageVisible.value = true
})
</script>


<template>
  <Transition name="fade">
    <h1 v-if="isPageVisible"
        class="text-4xl text-center font-bold text-stone-600 mt-10">
      Geometry Classifier
    </h1>
  </Transition>

  <section class="w-2/5 mx-auto p-2 mt-10">
    <div class="relative p-2 rounded border-2 border-dashed shadow-lg"
         :class="fileUploadClass">
      <label
        class="cursor-pointer"
        for="file-input"
        @dragover.prevent
        @drop="handleFileUpload"
      >
        <template v-if="!isFileUploaded">
          <p class="font-mono text-zinc-500 text-center">
            Upload a sample of data (.csv) (in the format: x,y,z,...,class)
          </p>
          <div
            class="absolute bottom-1/3 left-1/2 -translate-x-1/2 border border-white shadow-xl bg-black/70 hover:bg-black/80 text-gray-200 tracking-wider px-4 py-1.5 font-bold rounded-full">
            Upload
          </div>
        </template>

        <button v-else @click.prevent="file = null" title="clear upload"
                class="bg-red-500/50 border border-red-500/80 border border-red-600 rounded-full flex items-center px-2 text-bold text-red-900 font-bold hover:bg-red-500/80">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" class="size-4 mr-1">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          Clear
        </button>

        <SuccessIcon v-if="isFileUploaded"
                     class-styles="size-100 stroke-1 stroke-green-800/10 mx-auto" />
        <DatasetIcon v-else class-styles="size-100 stroke-1 stroke-zinc-300/40 mx-auto" />

        <input id="file-input"
               type="file"
               class="hidden"
               accept=".csv"
               @change="handleFileUpload" />
      </label>

      <p v-if="isFileUploaded" class="mt-2 text-center text-green-700">
        Downloaded: <span class="font-bold">{{ file?.name }}</span>
      </p>
    </div>


    <DisplayAnimation>
      <BtnClassify v-if="isFileUploaded"
                   class="mt-2 ml-auto"
                   label="Classify"
                   :loading="uploadDatasetLoading"
                   :disabled-on-loading="true"
                   @click="uploadDatasetHandler"
      />
    </DisplayAnimation>
  </section>
</template>


<style scoped>
.fade-enter-active {
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
