<template>
  <div ref="chartContainer" class="min-w-20 max-w-full bg-white/60" />
  <ul class="absolute top-40 left-10">
    <li class="flex items-center gap-x-2"
        v-for="(color,category) in classColors"
        :key="category">
      <div class="size-4" :style="{ backgroundColor: color }"></div>
      <h2>{{ category }}</h2>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import type { Sphere, TreeData } from '@/types/SphereType.ts'


const chartContainer = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let labelRenderer: CSS2DRenderer
let controls: OrbitControls

const props = defineProps<{
  tree: TreeData;
  title: string;
}>()

const classColors: Record<string, string> = reactive({})

const spheres = computed<Sphere[]>(() => {
  if (!props.tree?.nodes) return []

  props.tree.nodes.forEach((node) => {
    if (!classColors[node.class]) {
      const hue = Math.floor(Math.random() * 360)
      const saturation = 80 + Math.floor(Math.random() * 20)
      const lightness = 60 + Math.floor(Math.random() * 20)
      classColors[node.class] = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }
  })

  return props.tree.nodes.flatMap((node) => {
    const allSpheres = [...(node.u || []), ...(node.k || [])]
    return allSpheres.map((sphere) => ({
      center: { x: sphere.center[0], y: sphere.center[1], z: sphere.center[2] },
      radius: sphere.radius,
      class: sphere.class,
      color: classColors[sphere.class]
    }))
  })
})

const computeDomains = computed(() => {
  if (!spheres.value.length) {
    return {
      xDomain: [-2, 2],
      yDomain: [-2, 2],
      zDomain: [-2, 2]
    }
  }

  const minX = Math.min(...spheres.value.map((s) => s.center.x - s.radius))
  const maxX = Math.max(...spheres.value.map((s) => s.center.x + s.radius))
  const minY = Math.min(...spheres.value.map((s) => s.center.y - s.radius))
  const maxY = Math.max(...spheres.value.map((s) => s.center.y + s.radius))
  const minZ = Math.min(...spheres.value.map((s) => s.center.z - s.radius))
  const maxZ = Math.max(...spheres.value.map((s) => s.center.z + s.radius))

  const spanX = maxX - minX + 1
  const spanY = maxY - minY + 1
  const spanZ = maxZ - minZ + 1
  const maxSpan = Math.max(spanX, spanY, spanZ)

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const centerZ = (minZ + maxZ) / 2

  const xDomain =
    spanX >= Math.max(spanY, spanZ)
      ? [minX - 0.5, maxX + 0.5]
      : [centerX - maxSpan / 2, centerX + maxSpan / 2]
  const yDomain =
    spanY >= Math.max(spanX, spanZ)
      ? [minY - 0.5, maxY + 0.5]
      : [centerY - maxSpan / 2, centerY + maxSpan / 2]
  const zDomain =
    spanZ >= Math.max(spanX, spanY)
      ? [minZ - 0.5, maxZ + 0.5]
      : [centerZ - maxSpan / 2, centerZ + maxSpan / 2]

  return { xDomain, yDomain, zDomain }
})

const xDomain = computed(() => computeDomains.value.xDomain)
const yDomain = computed(() => computeDomains.value.yDomain)
const zDomain = computed(() => computeDomains.value.zDomain)

const initScene = () => {
  if (!chartContainer.value) return

  const width = chartContainer.value.clientWidth
  const height = chartContainer.value.clientHeight || 700

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  chartContainer.value.appendChild(renderer.domElement)

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(width, height)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'
  chartContainer.value.appendChild(labelRenderer.domElement)

  const maxDomainSize = Math.max(
    xDomain.value[1] - xDomain.value[0],
    yDomain.value[1] - yDomain.value[0],
    zDomain.value[1] - zDomain.value[0]
  )
  camera.position.set(maxDomainSize * 2, maxDomainSize * 2, maxDomainSize * 2)
  camera.lookAt(0, 0, 0)

  const ambientLight = new THREE.AmbientLight(0x404040)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(1, 1, 1).normalize()
  scene.add(directionalLight)

  const axesHelper = new THREE.AxesHelper(maxDomainSize)
  scene.add(axesHelper)

  const axisLabelOffset = maxDomainSize + 0.5
  const createLabel = (text: string, position: THREE.Vector3, color: string) => {
    const div = document.createElement('div')
    div.className = 'label'
    div.style.color = color
    div.style.fontSize = '16px'
    div.style.fontWeight = 'bold'
    div.textContent = text
    const label = new CSS2DObject(div)
    label.position.copy(position)
    scene.add(label)
  }

  createLabel('X', new THREE.Vector3(axisLabelOffset, 0, 0), '#ff0000')
  createLabel('Y', new THREE.Vector3(0, axisLabelOffset, 0), '#00ff00')
  createLabel('Z', new THREE.Vector3(0, 0, axisLabelOffset), '#0000ff')

  spheres.value.forEach((sphere) => {
    const geometry = new THREE.SphereGeometry(sphere.radius, 32, 32)
    const material = new THREE.MeshPhongMaterial({
      color: sphere.color,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(sphere.center.x, sphere.center.y, sphere.center.z)
    scene.add(mesh)
  })

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enabled = true
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1
  controls.maxDistance = maxDomainSize * 3

  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
  }
  animate()

  const resizeObserver = new ResizeObserver(() => {
    if (!chartContainer.value) return
    const newWidth = chartContainer.value.clientWidth
    const newHeight = chartContainer.value.clientHeight || 700
    camera.aspect = newWidth / newHeight
    camera.updateProjectionMatrix()
    renderer.setSize(newWidth, newHeight)
    labelRenderer.setSize(newWidth, newHeight)
  })
  resizeObserver.observe(chartContainer.value)
  chartContainer.value.resizeObserver = resizeObserver
}

onMounted(() => {
  initScene()
})

onUnmounted(() => {
  chartContainer.value?.resizeObserver?.disconnect()
  if (renderer) {
    renderer.dispose()
    chartContainer.value?.removeChild(renderer.domElement)
  }
  if (labelRenderer) {
    chartContainer.value?.removeChild(labelRenderer.domElement)
  }
  scene = null
  camera = null
  controls = null
})
</script>

