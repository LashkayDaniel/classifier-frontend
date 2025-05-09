import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ClassifyView from '@/views/ClassifyView.vue'
import { useDatasetStore } from '@/stores/dataset.ts'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/classify',
      name: 'classify',
      component: ClassifyView
    }
  ]
})

router.beforeEach((to) => {
  const datasetStore = useDatasetStore()
  if (to.name === 'classify' && !datasetStore.isUploaded) return '/'
  if (to.name === 'home' && datasetStore.isUploaded) return '/classify'
})

export default router
