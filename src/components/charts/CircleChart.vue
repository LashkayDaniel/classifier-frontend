<template>
  <div ref="chartContainer" class="min-w-20 max-w-[1000px] bg-white/60"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import * as d3 from 'd3'
import type { Sphere, TreeData } from '@/types/SphereType.ts'

const chartContainer = ref<HTMLDivElement | null>(null)
let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>

const props = defineProps<{
  tree: TreeData
  title: string
}>()

const classColors: Record<string, string> = {}

const spheres = computed<Sphere[]>(() => {
  if (!props.tree?.nodes) return []

  props.tree.nodes.forEach((node) => {
    if (!classColors[node.class]) {
      classColors[node.class] = `rgba(
        ${Math.floor(Math.random() * 100) + 10},
        ${Math.floor(Math.random() * 255)},
        ${Math.floor(Math.random() * 250)},
        0.2
      )`
    }
  })

  return props.tree.nodes.flatMap((node) => {
    const allSpheres = [...(node.u || []), ...(node.k || [])]
    return allSpheres.map((sphere) => ({
      center: { x: sphere.center[0], y: sphere.center[1] },
      radius: sphere.radius,
      class: sphere.class,
      color: classColors[sphere.class]
    }))
  })
})

const legendData = computed(() =>
  [...new Set(props.tree.nodes.map((n) => n.class))].map((className) => ({
    className,
    color: spheres.value.find((s) => s.class === className)?.color || 'gray'
  }))
)

const padding = 0.5

const xDomain = computed(() => {
  if (!spheres.value.length) return [-2, 2]
  const minX = Math.min(...spheres.value.map((s) => s.center.x - s.radius))
  const maxX = Math.max(...spheres.value.map((s) => s.center.x + s.radius))
  const minY = Math.min(...spheres.value.map((s) => s.center.y - s.radius))
  const maxY = Math.max(...spheres.value.map((s) => s.center.y + s.radius))

  const spanX = maxX - minX + 2 * padding
  const spanY = maxY - minY + 2 * padding
  const maxSpan = Math.max(spanX, spanY)
  const centerX = (minX + maxX) / 2

  if (spanX >= spanY) {
    return [minX - padding, maxX + padding]
  } else {
    return [centerX - maxSpan / 2, centerX + maxSpan / 2]
  }
})

const yDomain = computed(() => {
  if (!spheres.value.length) return [-2, 2]
  const minX = Math.min(...spheres.value.map((s) => s.center.x - s.radius))
  const maxX = Math.max(...spheres.value.map((s) => s.center.x + s.radius))
  const minY = Math.min(...spheres.value.map((s) => s.center.y - s.radius))
  const maxY = Math.max(...spheres.value.map((s) => s.center.y + s.radius))

  const spanX = maxX - minX + 2 * padding
  const spanY = maxY - minY + 2 * padding
  const maxSpan = Math.max(spanX, spanY)
  const centerY = (minY + maxY) / 2

  if (spanY >= spanX) {
    return [minY - padding, maxY + padding]
  } else {
    return [centerY - maxSpan / 2, centerY + maxSpan / 2]
  }
})

const renderChart = () => {
  if (!chartContainer.value) return
  const container = chartContainer.value
  const width = container.clientWidth
  const height = container.clientHeight || 700
  const margin = { top: 50, right: 20, bottom: 50, left: 50 }
  const size = Math.min(
    width - margin.left - margin.right,
    height - margin.top - margin.bottom
  )

  d3.select(container).select('svg').remove()

  const svgRoot = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const svg = svgRoot
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleLinear().domain(xDomain.value).range([0, size])
  const y = d3.scaleLinear().domain(yDomain.value).range([size, 0])

  const zoomed = (event: d3.D3ZoomEvent<any, any>) => {
    svg.attr('transform', event.transform)
  }

  svgRoot.call(
    d3.zoom()
      .scaleExtent([0.9, 5])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', zoomed)
  )

  drawGrid(svg, x, y, size)
  drawAxes(svg, x, y, size, margin)
  drawSpheres(svg, x, y)
  drawCenters(svg, x, y)
  drawLegend(svg, size)
  drawTitle(svg, props.title, size)
}

function drawGrid(svg, x, y, size) {
  svg
    .append('g')
    .attr('class', 'grid')
    .style('color', '#C0C0C0')
    .attr('transform', `translate(0,${size})`)
    .call(d3.axisBottom(x).ticks(10).tickSize(-size).tickFormat(() => ''))

  svg
    .append('g')
    .attr('class', 'grid')
    .style('color', '#C0C0C0')
    .call(d3.axisLeft(y).ticks(10).tickSize(-size).tickFormat(() => ''))
}

function drawAxes(svg, x, y, size, margin) {
  svg.append('g').attr('transform', `translate(0,${size})`).call(d3.axisBottom(x))
  svg.append('g').call(d3.axisLeft(y))

  svg
    .append('text')
    .attr('x', size / 2)
    .attr('y', size + margin.bottom - 10)
    .style('text-anchor', 'middle')
    .text('X-axis')

  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 15)
    .attr('x', -size / 2)
    .style('text-anchor', 'middle')
    .text('Y-axis')
}

function drawTitle(svg, title: string, size: number) {
  svg
    .append('text')
    .attr('x', size / 2)
    .attr('y', -10)
    .style('text-anchor', 'middle')
    .style('font-weight', 'bold')
    .text(title)
}

function drawSpheres(svg, x, y) {
  const pixelPerUnit = (x.range()[1] - x.range()[0]) / (x.domain()[1] - x.domain()[0])
  svg
    .selectAll('.sphere')
    .data(spheres.value)
    .join(
      (enter) =>
        enter
          .append('circle')
          .attr('class', 'sphere')
          .attr('cx', (d) => x(d.center.x))
          .attr('cy', (d) => y(d.center.y))
          .attr('r', 0)
          .attr('fill', (d) => d.color)
          .attr('stroke', (d) => d3.color(d.color)?.darker(2) || '#000')
          .attr('stroke-width', 1)
          .on('mouseover', (event, d) => {
            tooltip
              .html(
                `Center: (${d.center.x}, ${d.center.y})<br>Radius: ${d.radius}<br>Class: ${d.class}`
              )
              .style('visibility', 'visible')
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY + 10}px`)
          })
          .on('mousemove', (event) => {
            tooltip
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY + 10}px`)
          })
          .on('mouseout', () => {
            tooltip.style('visibility', 'hidden')
          })
          .call((enter) => enter
            .transition()
            .duration(500)
            .attr('r', (d) => Math.max(d.radius * pixelPerUnit, 0))
          ),
      (update) => update.call((update) =>
        update.transition()
          .duration(500)
          .attr('cx', (d) => x(d.center.x))
          .attr('cy', (d) => y(d.center.y))
          .attr('r', (d) => Math.max(d.radius * pixelPerUnit, 0))
      ),
      (exit) => exit.transition()
        .duration(500)
        .attr('r', 0)
        .remove()
    )
}

function drawCenters(svg, x, y) {
  svg
    .selectAll('.center')
    .data(spheres.value)
    .enter()
    .append('circle')
    .attr('class', 'center')
    .attr('cx', (d) => x(d.center.x))
    .attr('cy', (d) => y(d.center.y))
    .attr('r', 3)
    .attr('fill', (d) => d.color)
}

function drawLegend(svg, size: number) {
  const legend = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${size - 50}, 20)`)

  legendData.value.forEach((item, i) => {
    const g = legend.append('g').attr('transform', `translate(0, ${i * 20})`)
    g.append('circle').attr('r', 5).attr('fill', item.color)
    g.append('text').attr('x', 10).attr('y', 5).text(item.className)
  })
}

onMounted(() => {
  tooltip = d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.7)')
    .style('color', 'white')
    .style('padding', '5px 10px')
    .style('border-radius', '5px')
    .style('visibility', 'hidden')

  renderChart()

  const resizeObserver = new ResizeObserver(renderChart)
  if (chartContainer.value) {
    resizeObserver.observe(chartContainer.value)
    chartContainer.value.resizeObserver = resizeObserver
  }
})

onUnmounted(() => {
  chartContainer.value?.resizeObserver?.disconnect()
  d3.select('.tooltip').remove()
})
</script>
