<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, reactive, ref } from 'vue'
import DisplayAnimation from '@/components/animations/DisplayAnimation.vue'
import AccordionItem from '@/components/AccordionItem.vue'
import { useDatasetStore } from '@/stores/dataset.ts'
import router from '@/router'
import { onBeforeRouteLeave } from 'vue-router'

const datasetStore = useDatasetStore()

const classifyForm = reactive({
  coords: null,
  dimension: 2,
  result: null,
  error: null,
  loading: false
})

const tree = ref(null)
const BACK_URL = 'http://localhost:8080/api/v1'

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
      'http://localhost:8080/api/v1/classify',
      {
        coords: classifyForm.coords
      },
      {
        withCredentials: true
      }
    )
    classifyForm.result = resp.data?.result
    classifyForm.loading = false

  } catch (err) {
    console.log(err)
    classifyForm.error = err?.response.data?.error
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
    console.warn('Coordinates must not be greater than dataset dimension')
    return
  }
  classifyForm.coords = coords
}

function newDatasetBtnHandler() {
  datasetStore.reset()
  router.push('/')
}

onBeforeRouteLeave(() => {
  const answer = window.confirm(
    'Do you really want to leave? Your dataset will be reset!'
  )
  if (!answer) return false
})

onMounted(() => {
  getTree()
})
</script>

<template>
  <div class="w-full mt-4 mb-10 grid grid-cols-3 p-4">
    <button @click="newDatasetBtnHandler"
            class="bg-black/80 w-fit text-white text-zinc-200 shadow-xl font-semibold py-2 px-4 rounded hover:bg-zinc-700">
      Upload new dataset
    </button>
    <h1 class="text-4xl text-center text-stone-600 font-bold">
      Geometry Classifier
    </h1>
  </div>

  <form
    @submit.prevent="classifyHandle"
    class="bg-stone-400/30 border border-stone-400 shadow text-stone-800 flex flex-col p-4 px-5 mx-auto w-[500px] m-4 rounded-lg"
  >
    <div
      class="w-full border border-gray-400/50 rounded-lg py-2 px-4"
    >
      <div class="flex justify-between items-center">
        <label for="point" class="font-bold text-zinc-700 mr-2">Classify point:</label>
        <input
          id="point"
          class="bg-gray-100 flex-1 px-2 py-1 rounded-lg font-bold placeholder:text-zinc-500 placeholder:font-medium"
          type="text"
          placeholder="e.g. 2.6, 3.0, 2.5"
          @input="coordsInputHandle"
        />
      </div>
      <i class="text-sm text-zinc-600">point dimension: {{ classifyForm.dimension }}</i>
    </div>
    <DisplayAnimation>
      <p v-show="classifyForm?.coords?.length>0"
         class="text-center">input point: {{ classifyForm.coords }}</p>
    </DisplayAnimation>
    <button
      class="bg-green-500 rounded-full cursor-pointer border-b-3 border-green-600 px-4 mx-10 py-2 text-green-900 font-bold mt-4 hover:bg-green-500/60 transition-all"
      :class="{'cursor-progress bg-green-500/60'  : classifyForm.loading}"
      :disabled="!isActiveBtnClassify"
    >
      {{ classifyForm.loading ? 'loading...' : 'Classify' }}
    </button>

    <DisplayAnimation>
      <p v-if="classifyForm.result" class="text-center mt-4">
        Result:
        <span class="font-semibold">"{{ classifyForm.result }}"</span>
      </p>

      <p v-else-if="classifyForm.error" class="text-center text-red-500 mt-4">
        Error:
        <span class="font-semibold">"{{ classifyForm.error }}"</span>
      </p>
    </DisplayAnimation>
  </form>

  <div v-if="tree">
    <AccordionItem title="Show tree">
      <pre><code>{{ tree }}</code></pre>
    </AccordionItem>
  </div>
</template>
