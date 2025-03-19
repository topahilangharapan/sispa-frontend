import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DesignSystemView from '../views/DesignSystemView.vue'
import InventoryView from '../views/InventoryView.vue'
import FinanceView from '../views/FinanceView.vue'
import ClientView from '../views/ClientView.vue'
import VendorView from '../views/VendorView.vue'
import AddVendorView from '../views/AddVendorView.vue'
import StaffAndFreelancerView from '../views/StaffAndFreelancerView.vue'
import DashboardView from '../views/DashboardView.vue'
import { roleGuard } from './guards/auth.ts'
import RegisterView from '../views/auth/RegisterView.vue'
import LoginView from '../views/auth/LoginView.vue'
import VendorDetail from '../views/VendorDetail.vue'
import CreatePurchaseOrderView from '../views/purchase order/CreatePurchaseOrderView.vue'
import MarketingView from '../views/MarketingView.vue'
import ProfileView from '../views/ProfileView.vue'
import UpdateVendorView from '../views/UpdateVendorView.vue'
import ClientDetailView from '../views/ClientDetailView.vue'
import UpdateClientView from '../views/UpdateClientView.vue'
import AddClientView from '../views/AddClientView.vue'
import PurchaseOrderList from '../views/purchase order/PurchaseOrderList.vue'
import PurchaseOrderDetail from '../views/purchase order/PurchaseOrderDetail.vue'
import CreateInvoiceView from '../views/invoice/CreateInvoiceView.vue'
import PurchasingView from '../views/PurchasingView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    beforeEnter: roleGuard
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: RegisterView,
    beforeEnter: roleGuard
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    beforeEnter: roleGuard
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryView,
    beforeEnter: roleGuard
  },
  {
    path: '/finance',
    name: 'Finance',
    component: FinanceView,
    beforeEnter: roleGuard
  },
  {
    path: '/finance/invoice/create',
    name: 'Create Invoice',
    component: CreateInvoiceView,
    beforeEnter: roleGuard
  },
  {
    path: '/marketing/client',
    name: 'Client',
    component: ClientView,
    beforeEnter: roleGuard
  },
  {
    path: '/purchasing',
    name: 'Purchasing',
    component: PurchasingView,
    beforeEnter: roleGuard
  },
  {
    path: '/purchasing/vendor',
    name: 'Vendor',
    component: VendorView,
    beforeEnter: roleGuard
  },
  {
    path: '/purchasing/vendor/:id',
    name: 'Vendor Detail',
    component: VendorDetail,
    beforeEnter: roleGuard
  },
  {
    path: '/staff-freelancer',
    name: 'Staff and Freelancer',
    component: StaffAndFreelancerView,
    beforeEnter: roleGuard
  },
  {
    path: '/design-system',
    name: 'Design System',
    component: DesignSystemView
  },
  {
    path: '/marketing',
    name: 'Marketing',
    component: MarketingView,
    beforeEnter: roleGuard
  },
  {
    path: '/marketing/purchase-order/create',
    name: 'Create Purchase Order',
    component: CreatePurchaseOrderView,
    beforeEnter: roleGuard
  },
  {
    path: '/marketing/purchase-order',
    name: 'Purchase Order List',
    component: PurchaseOrderList
  },
  {
    path: '/marketing/purchase-order/:id',
    name: 'Purchase Order Detail',
    component: PurchaseOrderDetail,
    props: true
  },
  {
    path: '/marketing/purchase-order',
    name: 'PurchaseOrderList',
    component: PurchaseOrderList
  },
  {
    path: '/marketing/purchase-order/:id',
    name: 'PurchaseOrderDetail',
    component: PurchaseOrderDetail,
    props: true
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView
  },
  {
    path: '/purchasing/vendor/add',
    name: 'Add Vendor',
    component: AddVendorView,
    beforeEnter: roleGuard
  },
  {
    path: '/purchasing/vendor/:id/update',
    name: 'Update Vendor',
    component: UpdateVendorView,
    beforeEnter: roleGuard
  },
  {
    path: '/marketing/client/:id',
    name: 'Client Detail',
    component: ClientDetailView,
    beforeEnter: roleGuard
  },
  {
    path: '/marketing/client/:id/update',
    name: 'Update Client',
    component: UpdateClientView,
    beforeEnter: roleGuard
  },
  {
    path: '/marketing/client/add',
    name: 'Add Client',
    component: AddClientView,
    beforeEnter: roleGuard
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
