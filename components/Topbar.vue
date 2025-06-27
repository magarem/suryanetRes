<template>
  <header class="flex items-center justify-between h-16 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 sticky top-0 z-20">
    <!-- Sidebar Toggle Button & Domain Name -->
    <div class="flex items-center">
      <button @click="$emit('toggleSidebar')" class="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
        <Menu class="h-6 w-6" />
      </button>
      <h1 class="text-xl font-bold text-white ml-4 hidden sm:block">Novagokula</h1>
    </div>

    <!-- Search and User Actions -->
    <div class="flex items-center space-x-4">
      <!-- Search Bar -->
      <div class="relative hidden md:block">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search class="h-5 w-5 text-gray-400" />
        </span>
        <input
          class="w-full py-2 pl-10 pr-4 bg-gray-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          type="text"
          placeholder="Search..."
        />
      </div>

      <!-- Notification Bell with Dropdown -->
      <div class="relative" ref="notificationMenu">
        <button @click="isNotificationOpen = !isNotificationOpen" class="p-2 rounded-full hover:bg-gray-700 focus:outline-none">
          <Bell class="h-6 w-6" />
           <span class="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- Notification Dropdown Panel -->
        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div v-show="isNotificationOpen" class="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-10">
            <div class="p-4 font-semibold border-b border-gray-700">Notifications</div>
            <div class="divide-y divide-gray-700">
              <a v-for="notification in notifications" :key="notification.text" href="#" class="flex items-start px-4 py-3 hover:bg-gray-700">
                  <component :is="notification.icon" class="h-5 w-5 mt-1" :class="notification.color" />
                  <div class="ml-4">
                      <p class="text-sm font-medium">{{ notification.text }}</p>
                      <p class="text-xs text-gray-400">{{ notification.time }}</p>
                  </div>
              </a>
               <a href="#" class="flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-gray-700">
                View all notifications
              </a>
            </div>
          </div>
        </transition>
      </div>

      <!-- User Profile Dropdown -->
      <div class="relative" ref="userMenu">
        <button @click="isUserMenuOpen = !isUserMenuOpen" class="flex items-center space-x-2 focus:outline-none">
          <img
            class="h-9 w-9 rounded-full object-cover ring-2 ring-offset-2 ring-offset-gray-800 ring-transparent"
            src="https://placehold.co/100x100/6366f1/e0e7ff?text=JD"
            alt="User avatar"
          />
          <span class="sm:inline">{{user?.name}}</span>
        </button>
        
        <!-- User Dropdown Panel -->
         <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div v-show="isUserMenuOpen" class="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-10">
            <template v-for="item in userMenuItems" :key="item.name">
              <div v-if="item.type === 'separator'" class="border-t border-gray-700 my-1"></div>
              
              <!-- Render a button for items with an action -->
              <button v-else-if="item.action" @click="item.action" class="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-700" :class="item.class || 'text-gray-300'">
                <component :is="item.icon" class="w-5 h-5 mr-2" /> {{ item.name }}
              </button>
              
              <!-- Render a link for items with an href -->
              <a v-else :href="item.href" class="flex items-center px-4 py-2 text-sm hover:bg-gray-700" :class="item.class || 'text-gray-300'">
                <component :is="item.icon" class="w-5 h-5 mr-2" /> {{ item.name }}
              </a>
            </template>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, Search, Bell, UserPlus, Server, UserCircle, Settings, LogOut } from 'lucide-vue-next';

// Define the event that this component can emit
defineEmits(['toggleSidebar']);

const { user, clear: clearSession } = useUserSession()
// 2. Create a computed property for the user's ID.
// This is reactive and safely handles cases where the user is initially null.
const userId = computed(() => user.value?.id);

console.log('userId', userId.value);

async function logout() {
  await clearSession()
  await navigateTo('/login')
}

const router = useRouter();

// Reactive state for dropdown visibility
const isNotificationOpen = ref(false);
const isUserMenuOpen = ref(false);

// --- Functions for menu actions ---
const handleLogout = () => {
    console.log('Logging out...');
    isUserMenuOpen.value = false; // Close the menu
    router.push('/login');
};

// Data-driven notifications
const notifications = shallowRef([
  { icon: UserPlus, text: 'New user registered', time: '1 hour ago', color: 'text-blue-400' },
  { icon: Server, text: 'Server overload', time: '2 hours ago', color: 'text-red-400' },
]);

// Data-driven user menu with actions
const userMenuItems = shallowRef([
  { name: 'Profile', href: '/profile', icon: UserCircle },
  { name: 'Settings', href: '#', icon: Settings },
  { type: 'separator' },
  { name: 'Logout', icon: LogOut, class: 'text-red-400', action: logout },
]);


// Template refs to get DOM elements
const notificationMenu = ref(null);
const userMenu = ref(null);

// Function to close menus when clicking outside
const handleClickOutside = (event) => {
  if (notificationMenu.value && !notificationMenu.value.contains(event.target)) {
    isNotificationOpen.value = false;
  }
  if (userMenu.value && !userMenu.value.contains(event.target)) {
    isUserMenuOpen.value = false;
  }
};

// Add and remove click listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
