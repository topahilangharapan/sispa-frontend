<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import VNavbar from '../components/VNavbar.vue';
import { useAuthStore } from '../stores/auth.ts';

const router = useRouter();
const authStore = useAuthStore();

const title = ref({ 'Dashboard': '/dashboard' });

// Define the available role-based navigation
const roleBasedNavigation = ref([
  { 
    title: 'Cash Flow Management', 
    path: '/finance/cashflow',
    icon: 'cash-flow',
    description: 'View and manage company cash flow',
    color: 'bg-green-500',
    roles: ['finance', 'admin', 'manajemen']
  },
  { 
    title: 'Invoice Management', 
    path: '/finance/invoice',
    icon: 'invoice',
    description: 'Create and manage invoices',
    color: 'bg-blue-500',
    roles: ['finance', 'admin', 'manajemen']
  },
  { 
    title: 'Document Management', 
    path: '/marketing',
    icon: 'document',
    description: 'Create purchase orders and final reports',
    color: 'bg-purple-500',
    roles: ['marketing', 'admin', 'manajemen']
  },
  { 
    title: 'Client Management', 
    path: '/marketing/client',
    icon: 'client',
    description: 'Manage clients',
    color: 'bg-yellow-500',
    roles: ['marketing', 'admin', 'manajemen']
  },
  { 
    title: 'Vendor Management', 
    path: '/purchasing/vendor',
    icon: 'vendor',
    description: 'Manage vendors',
    color: 'bg-pink-500',
    roles: ['purchasing', 'admin', 'manajemen']
  },
  { 
    title: 'Inventory Management', 
    path: '/purchasing',
    icon: 'inventory',
    description: 'Manage inventory and stock',
    color: 'bg-red-500',
    roles: ['purchasing', 'admin', 'manajemen']
  },
  { 
    title: 'Staff and Freelancer Management', 
    path: '/staff-freelancer',
    icon: 'staff',
    description: 'Manage employees',
    color: 'bg-indigo-500',
    roles: ['admin', 'manajemen']
  },
  { 
    title: 'User Registration', 
    path: '/auth/register',
    icon: 'users',
    description: 'Register and manage system users',
    color: 'bg-gray-700',
    roles: ['admin']
  }
]);

// Get current user roles from the auth store
const userRoles = computed<string[]>(() => authStore.user?.role?.toLowerCase().split(',') || []);

// Filter navigation items based on roles
const filteredNavigation = computed(() => {
  return roleBasedNavigation.value.filter(navItem =>
    navItem.roles.some(role => userRoles.value.includes(role))
  );
});

// Navigation function
const navigateTo = (path: string) => {
  router.push(path);
};

// On mounted, check authentication (optional step)
onMounted(() => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }
});
</script>

<template>
  <VNavbar :title="title"></VNavbar>
  <div>
    <div class="p-6">
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Quick Access</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="(nav, index) in filteredNavigation" 
            :key="index"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300"
            @click="navigateTo(nav.path)"
          >
            <div :class="nav.color + ' p-4 text-white flex items-center justify-center h-24'">
              <span class="text-2xl font-bold">{{ nav.title }}</span>
            </div>
            <div class="p-4">
              <p class="text-gray-600">{{ nav.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
