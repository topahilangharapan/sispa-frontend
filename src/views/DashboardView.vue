<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import VNavbar from '../components/VNavbar.vue';

const router = useRouter();
const title = ref({ 'Dashboard': '/dashboard' });

// Navigation function
const navigateTo = (path: string) => {
  router.push(path);
};

const roleBasedNavigation = ref([
  {
    title: 'Cash Flow Management',
    path: '/finance/cashflow',
    icon: 'cash-flow',
    description: 'View and manage company cash flow',
    color: 'bg-green-500'
  },
  {
    title: 'Invoice Management',
    path: '/finance/invoice',
    icon: 'invoice',
    description: 'Create and manage invoices',
    color: 'bg-blue-500'
  },
  {
    title: 'Document Management',
    path: '/marketing',
    icon: 'document',
    description: 'Create purchase orders and final reports',
    color: 'bg-purple-500'
  },
  {
    title: 'Client Management',
    path: '/marketing/clients',
    icon: 'client',
    description: 'Manage clients and vendors',
    color: 'bg-yellow-500'
  },
  {
    title: 'Inventory Management',
    path: '/purchasing/inventory',
    icon: 'inventory',
    description: 'Manage inventory and stock',
    color: 'bg-red-500'
  },
  {
    title: 'Staff and Freelancer Management',
    path: '/staff-freelancer',
    icon: 'staff',
    description: 'Manage employees',
    color: 'bg-indigo-500'
  },
  {
    title: 'User Registration',
    path: '/auth/register',
    icon: 'users',
    description: 'Register and manage system users',
    color: 'bg-gray-700'
  }
]);

</script>

<template>
  <VNavbar :title="title"></VNavbar>
  <div>
    <div class="p-6">
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Quick Access</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(nav, index) in roleBasedNavigation"
            :key="index"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300"
            @click="navigateTo(nav.path)"
          >
            <div :class="`${nav.color} p-4 text-white flex items-center justify-center h-24`">
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
