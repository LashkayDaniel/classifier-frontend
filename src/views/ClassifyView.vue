<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, reactive, ref } from 'vue'
import DisplayAnimation from '@/components/animations/DisplayAnimation.vue'
import AccordionItem from '@/components/AccordionItem.vue'
import { useDatasetStore } from '@/stores/dataset.ts'
import router from '@/router'
import { onBeforeRouteLeave } from 'vue-router'
import CircleChart from '@/components/charts/CircleChart.vue'
import SphereChart from '@/components/charts/SphereChart.vue'
import { useToastStore } from '@/stores/toast.ts'

const datasetStore = useDatasetStore()
const toastStore = useToastStore()

const BACK_URL = 'http://localhost:8080/api/v1'

const classifyForm = reactive({
  coords: null,
  dimension: 2,
  result: null,
  error: null,
  loading: false
})
const tree = ref(null)

const isActiveBtnClassify = computed(() => {
  const { coords, dimension } = classifyForm
  return coords?.length === dimension
})

async function getTree() {
  try {
    const response = await axios.get(`${BACK_URL}/tree`)
    tree.value = response.data
    classifyForm.dimension = response.data?.dimension
  } catch (err) {
    console.error(err?.message)
  }
}

async function classifyHandle() {
  classifyForm.result = null
  classifyForm.error = null
  classifyForm.loading = true
  try {
    const resp = await axios.post(
      `${BACK_URL}/classify`,
      {
        coords: classifyForm.coords
      },
      {
        withCredentials: true
      }
    )
    classifyForm.result = resp.data?.result
  } catch (err) {
    console.log(err)
    classifyForm.error = err?.response.data?.error
  } finally {
    classifyForm.loading = false
  }
}

function clearClassifyResult() {
  if (classifyForm.result !== null) classifyForm.result = null
}

function coordsInputHandle(event: Event) {
  clearClassifyResult()
  const coords = event.target?.value
    .split(',')
    .map((n: string) => parseFloat(n))
    .filter((n: number) => !isNaN(n))

  if (coords.length > classifyForm.dimension) {
    toastStore.add({
      type: 'warning',
      title: 'Warning',
      message: 'Input object dimension must match the training data dimension',
      durationShow: 4
    })
    return
  }
  classifyForm.coords = coords
}

function newDatasetBtnHandler() {
  const answer = window.confirm(
    'Your dataset will be lost. Are you sure you want to upload a new one?'
  )
  if (!answer) return false
  datasetStore.reset()
  router.push('/')
}

onBeforeRouteLeave(() => {
  if (datasetStore.isUploaded) {
    const answer = window.confirm(
      'Do you really want to leave? Your current dataset will be reset!'
    )
    if (!answer) return false
  }
})

onMounted(() => {
  getTree()
})
</script>

<template>
  <div
    class="w-full mt-2 sm:mt-4 mb-10 grid grid-cols-2 sm:grid-cols-3 gap-x-2 items-center p-2 sm:p-4">
    <button @click="newDatasetBtnHandler"
            class="bg-black/80 w-fit h-fit flex space-x-2 place-self-end sm:place-self-auto items-center text-white text-sm sm:text-base text-zinc-200 shadow-xl font-semibold py-2 px-3 sm:px-4 rounded hover:bg-zinc-700">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
           stroke="currentColor" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
      <span>Upload new dataset</span>
    </button>
    <h1
      class="order-first sm:order-none text-start text-3xl sm:text-4xl sm:text-center text-stone-600 font-bold">
      Geometry Classifier
    </h1>
  </div>

  <form
    @submit.prevent="classifyHandle"
    class="bg-stone-400/30 backdrop-blur-md border border-stone-400 shadow text-stone-800 flex flex-col py-4 px-3 ms:px-5 w-[95%] mx-auto max-w-md rounded-lg"
  >
    <div
      class="w-full border border-gray-400/50 rounded-lg py-2 px-4"
    >
      <div class="flex flex-col sm:flex-row justify-between sm:items-center">
        <label for="point" class="font-bold text-zinc-700 mr-2">Classify an object:</label>
        <input
          id="point"
          class="bg-gray-100 flex-1 text-sm sm:text-base px-2 py-1 mt-2 sm:mt-0 rounded-lg font-bold placeholder:text-zinc-500 placeholder:font-medium outline-none ring-0 border border-gray-300 focus:border-black/60 focus:ring-black/40"
          type="text"
          placeholder="e.g. 2.6, 3.0, 2.5"
          @input="coordsInputHandle"
          autofocus
        />
      </div>
      <i class="text-xs sm:text-sm text-zinc-600">object dimension: {{ classifyForm.dimension }}</i>
    </div>
    <DisplayAnimation>
      <p v-show="classifyForm?.coords?.length>0"
         class="text-center text-zinc-600 font-semibold text-sm sm:text-base">
        input object: {{ classifyForm.coords }}
      </p>
    </DisplayAnimation>

    <button
      class="bg-black/75 uppercase tracking-wider flex space-x-2 items-center justify-center rounded-full shadow-md cursor-pointer border-b-3 border-gray-700 px-4 mx-10 py-2 text-zinc-200 font-semibold text-sm sm:text-base mt-4 hover:bg-black/85 transition-all"
      :class="{'cursor-progress'  : classifyForm.loading}"
      :disabled="!isActiveBtnClassify"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
           stroke="currentColor" class="size-4 sm:size-6">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
      </svg>
      <span>{{ classifyForm.loading ? 'loading...' : 'Classify' }}</span>
    </button>


    <DisplayAnimation>
      <p v-if="classifyForm.result"
         class="text-center font-semibold py-1 mt-4 bg-gradient-to-r from-transparent via-amber-200/60 to-transparent text-amber-600 text-md sm:text-lg">
        Class:
        <span class="font-semibold">"{{ classifyForm.result }}"</span>
      </p>

      <p v-else-if="classifyForm.error" class="text-center text-red-500 mt-4">
        Error:
        <span class="font-semibold">"{{ classifyForm.error }}"</span>
      </p>
    </DisplayAnimation>
  </form>

  <div v-if="tree">
    <AccordionItem v-if="tree?.dimension===2" title="Show visualization">
      <CircleChart :tree
                   title="2d spheres"
                   class="mx-auto" />
    </AccordionItem>

    <AccordionItem v-if="tree?.dimension===3" title="Show visualization">
      <SphereChart title="3d spheres" :tree />
    </AccordionItem>

    <AccordionItem title="Show classification tree">
      <div class="text-zinc-700 px-6 text-sm">
        Where <b>dimension</b> is the number of dimension of the data points in the
        tree, <b>nodes</b> are the elements of the tree, each representing a hypersphere with the
        following properties:<br>
        <ul class="list-disc ps-6">
          <li><b>class</b> — the classification label assigned to the node,<br></li>
          <li><b>u</b> — optimally approximated set of hyperspheres,</li>
          <li><b>k</b> — the remaining set of hyperspheres,</li>
          <li><b>center</b> — the coordinates of the hypersphere’s center,</li>
          <li><b>radius</b> — the radius of the hypersphere,</li>
          <li><b>m</b> — the power/weight of the hypersphere.</li>
        </ul>
      </div>
      <hr class="text-zinc-400/70 my-2">
      <pre class="mt-4 text-xs sm:text-sm"><code>{{ tree }}</code></pre>
    </AccordionItem>
  </div>
</template>
