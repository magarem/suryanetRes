<template>
  <aside
    class="fixed top-0 left-0 h-full bg-gray-800 text-gray-300 flex flex-col transition-all duration-300 ease-in-out z-30"
    :class="isOpen ? 'w-64' : 'w-20'"
  >
    <!-- Logo and App Name -->
    <div class="flex items-center justify-center h-16 border-b border-gray-700 flex-shrink-0">
      <svg class="h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <span v-show="isOpen" class="ml-3 text-lg font-bold">SuryaNet</span>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-4 py-6 space-y-2">
      <!-- Loop through menu items -->
      <div v-for="item in menuItems" :key="item.name">
        
        <!-- Standard Menu Item -->
        <a v-if="!item.children" :href="item.href" class="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-700" :class="route.path === item.href ? 'bg-gray-700 text-white' : ''">
          <component :is="item.icon" class="h-6 w-6" />
          <span v-show="isOpen" class="ml-4">{{ item.name }}</span>
        </a>

        <!-- Collapsible Menu Group -->
        <div v-if="item.children && isOpen">
          <button @click="toggleMenu(item.name)" class="w-full flex items-center justify-between p-2 text-base font-normal rounded-lg hover:bg-gray-700">
            <div class="flex items-center">
              <component :is="item.icon" class="h-6 w-6" />
              <span class="ml-4">{{ item.name }}</span>
            </div>
            <ChevronDown class="h-5 w-5 transition-transform duration-200" :class="openMenus[item.name] ? 'rotate-180' : ''" />
          </button>
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-96 opacity-100"
            leave-from-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
           >
            <div v-show="openMenus[item.name]" class="mt-1 pl-6 space-y-1 overflow-hidden">
                <a v-for="child in item.children" :key="child.name" :href="child.href" class="block p-2 text-sm rounded-lg hover:bg-gray-700">{{ child.name }}</a>
            </div>
           </transition>
        </div>

      </div>
    </nav>

    <!-- Logout Section -->
    <div class="px-4 py-4 border-t border-gray-700 mt-auto flex-shrink-0">
       <a href="/login" class="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-700">
        <Settings class="h-6 w-6" />
        <span v-show="isOpen" class="ml-4">Settings</span>
      </a>
    </div>
  </aside>
</template>

<script setup>
import { ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { 
    LayoutDashboard, 
    Users, 
    Mail,
    UserCircle,
    FileText,
    FileStack,
    BarChart3, 
    Settings, 
    LogOut, 
    ChevronDown 
} from 'lucide-vue-next';

// Get the current route to highlight the active link
const route = useRoute();

// Define props that the component accepts
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

// --- Data-driven menu structure ---
// Using shallowRef for performance, as the components within are static.
const menuItems = shallowRef([
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Users', href: '#', icon: Users },
    { name: 'Messages', href: '/messages', icon: Mail },
    { name: 'Fidelis', href: '/messages2', icon: Mail },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { 
        name: 'Extra Pages', 
        icon: FileStack,
        children: [
            { name: 'Authentication', href: '#' },
            { name: 'Pricing', href: '#' },
            { name: 'Invoice', href: '#' },
        ]
    },
    { name: 'Analytics', href: '#', icon: BarChart3 },
    // { name: 'Settings', href: '#', icon: Settings },
]);

// Reactive state for the collapsible menus
const openMenus = ref({});

const toggleMenu = (name) => {
    openMenus.value[name] = !openMenus.value[name];
};
</script>
