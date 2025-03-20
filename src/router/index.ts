import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DesignSystemView from '../views/DesignSystemView.vue'
import InventoryView from '../views/InventoryView.vue'
import VendorView from '../views/VendorView.vue'
import AddVendorView from '../views/AddVendorView.vue'
import StaffAndFreelancerView from '../views/StaffAndFreelancerView.vue'
import DashboardView from '../views/DashboardView.vue'
import { roleGuard } from './guards/auth.ts'
import RegisterView from '../views/auth/RegisterView.vue'
import LoginView from '../views/auth/LoginView.vue'
import VendorDetail from '../views/VendorDetail.vue'
import ProfileView from '../views/ProfileView.vue'
import UpdateVendorView from '../views/UpdateVendorView.vue'
import PurchasingView from '../views/PurchasingView.vue'
import FinanceView from '../views/finance/FinanceView.vue'
import CreateInvoiceView from '../views/finance/invoice/CreateInvoiceView.vue'
import MarketingView from '../views/marketing/MarketingView.vue'
import CreatePurchaseOrderView from '../views/marketing/purchase order/CreatePurchaseOrderView.vue'
import CreateFinalReportView from '../views/marketing/final report/CreateFinalReportView.vue'
import InvoiceDetailView from '../views/finance/invoice/InvoiceDetailView.vue'
import InvoiceListView from '../views/finance/invoice/InvoiceListView.vue'
import PurchaseOrderDetailView from '../views/marketing/purchase order/PurchaseOrderDetailView.vue'
import PurchaseOrderListView from '../views/marketing/purchase order/PurchaseOrderListView.vue'
import AddClientView from '../views/marketing/client/AddClientView.vue'
import ClientView from '../views/marketing/client/ClientView.vue'
import ClientDetailView from '../views/marketing/client/ClientDetailView.vue'
import UpdateClientView from '../views/marketing/client/UpdateClientView.vue'
import FinalReportListView from '../views/marketing/final report/FinalReportListView.vue'
import FinalReportDetailView from '../views/marketing/final report/FinalReportDetailView.vue'

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
    component: PurchaseOrderListView,
    beforeEnter: roleGuard
  },
  {
    path: '/marketing/purchase-order/:id',
    name: 'Purchase Order Detail',
    beforeEnter: roleGuard,
    component: PurchaseOrderDetailView,
    props: true
  },
  {
    path: '/marketing/final-report/create',
    name: 'Create Final Report',
    component: CreateFinalReportView,
    beforeEnter: roleGuard
  },
  {
    path: '/marketing/final-report',
    name: 'View All Final Report',
    component: FinalReportListView,
    beforeEnter: roleGuard
  },
  {
    path: '/marketing/final-report/:id',
    name: 'View Detail Final Report',
    component: FinalReportDetailView,
    beforeEnter: roleGuard,
    props: true
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
    path: '/finance/invoice',
    name: 'InvoiceList',
    component: InvoiceListView,
    beforeEnter: roleGuard
  },
  {
    path: '/finance/invoice/:id',
    name: 'InvoiceDetail',
    component: InvoiceDetailView,
    beforeEnter: roleGuard
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    beforeEnter: roleGuard
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
