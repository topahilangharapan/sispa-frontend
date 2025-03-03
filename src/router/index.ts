import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DesignSystemView from '../views/DesignSystemView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/design-system',
    name: 'DesignSystem',
    component: DesignSystemView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
