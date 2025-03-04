import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DesignSystemView from '../views/DesignSystemView.vue'
import InventoryView from '../views/InventoryView.vue'
import FinanceView from '../views/FinanceView.vue'
import ClientView from '../views/ClientView.vue'
import VendorView from '../views/VendorView.vue'
import StaffAndFreelancerView from '../views/StaffAndFreelancerView.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryView,
  },
  {
    path: '/finance',
    name: 'Finance',
    component: FinanceView,
  },
  {
    path: '/client',
    name: 'Client',
    component: ClientView,
  },
  {
    path: '/vendor',
    name: 'Vendor',
    component: VendorView,
  },
  {
    path: '/staff-freelancer',
    name: 'Staff and Freelancer',
    component: StaffAndFreelancerView,
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
