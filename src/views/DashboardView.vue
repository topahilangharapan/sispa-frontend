<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import VNavbar from '../components/VNavbar.vue';
import { useAuthStore } from '../stores/auth.ts';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  ShoppingCart,
  Megaphone,
  Users,
  UserPlus,
  LogOut,
  Archive
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const title = ref({ 'Dashboard': '/dashboard' });

const roleBasedNavigation = ref([
  {
    title: 'Manajemen Arus Kas',
    path: '/finance/cashflow',
    icon: ShoppingCart,
    description: 'View and manage company cash flow',
    roles: ['finance', 'admin', 'manajemen']
  },
  {
    title: 'Manajemen Invoice',
    path: '/finance/invoice',
    icon: FileText,
    description: 'Create and manage invoices',
    roles: ['finance', 'admin', 'manajemen']
  },
  {
    title: 'Manajemen Dokumen',
    path: '/marketing',
    icon: FileText,
    description: 'Create purchase orders and final reports',
    roles: ['marketing', 'admin', 'manajemen']
  },
  {
    title: 'Manajemen Klien',
    path: '/marketing/client',
    icon: Users,
    description: 'Manage clients',
    roles: ['marketing', 'admin', 'manajemen']
  },
  {
    title: 'Manajemen Vendor',
    path: '/purchasing/vendor',
    icon: Users,
    description: 'Manage vendors',
    roles: ['purchasing', 'admin', 'manajemen']
  },
  {
    title: 'Manajemen Inventaris',
    path: '/purchasing/item',
    icon: Archive,
    description: 'Manage inventory items',
    roles: ['purchasing', 'admin', 'manajemen']
  },
  {
    title: 'Manajemen Freelancer',
    path: '/freelancer',
    icon: Users,
    description: 'Manage employees and freelancers',
    roles: ['admin', 'manajemen']
  },
  {
    title: 'Registrasi User',
    path: '/auth/register',
    icon: UserPlus,
    description: 'Register and manage system users',
    roles: ['admin']
  }
]);

const userRoles = computed<string[]>(() => authStore.user?.role?.toLowerCase().split(',') || []);

const filteredNavigation = computed(() => {
  return roleBasedNavigation.value.filter(navItem =>
    navItem.roles.some(role => userRoles.value.includes(role))
  );
});

const navigateTo = (path: string) => {
  router.push(path);
};

onMounted(() => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }
});
</script>
<template>
  <VNavbar :title="title" />
  <section class="p-6 min-h-screen mt-26">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(nav, index) in filteredNavigation"
          :key="index"
          class="group bg-white-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-brown-100"
          @click="navigateTo(nav.path)"
        >
          <div class="p-6 flex items-center gap-4">
            <!-- ICON WRAPPER -->
            <div class="w-14 h-14 flex items-center justify-center rounded-xl bg-red-200 group-hover:bg-red-175 transition-colors">
              <component :is="nav.icon" class="w-6 h-6 text-white-100" />
            </div>
            <!-- TEXT WRAPPER -->
            <div>
              <h3 class="text-lg font-semibold text-red-400 group-hover:text-red-200 transition-colors">
                {{ nav.title }}
              </h3>
              <p class="text-sm text-black-grey-600">{{ nav.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
