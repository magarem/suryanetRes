<script setup>
import { ref } from 'vue'

// Sidebar toggle
const sidebarOpen = ref(true)

// Dark mode toggle
const isDark = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
}
</script>

<template>
  <!-- Root element with dark mode -->
  <div :class="{ 'dark': isDark }" class="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">

    <!-- Sidebar -->
    <aside
      :class="['w-64 bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700 transition-transform transform md:translate-x-0', { '-translate-x-full': !sidebarOpen }]"
      class="fixed inset-y-0 left-0 z-30 md:relative md:flex md:flex-col md:w-64 md:translate-x-0 md:z-0"
    >
      <div class="text-2xl font-bold mb-6">Dashboard</div>
      <nav class="space-y-4">
        <a href="#" class="block hover:text-blue-500">Home</a>
        <a href="#" class="block hover:text-blue-500">Profile</a>
        <a href="#" class="block hover:text-blue-500">Settings</a>
      </nav>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" @click="toggleSidebar"></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <header class="flex items-center justify-between bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700">
        <div class="flex items-center space-x-4">
          <button @click="toggleSidebar" class="md:hidden">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 class="text-xl font-bold">Dashboard</h1>
        </div>

        <!-- Dark Mode Toggle -->
        <button @click="toggleDarkMode" class="p-2 bg-gray-200 dark:bg-gray-700 rounded">
          <svg v-if="!isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m8.485-8.485h-1M4.515 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 5a7 7 0 000 14a7 7 0 000-14z"></path>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"></path>
          </svg>
        </button>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <h2 class="text-2xl font-bold mb-4">Welcome to the Dashboard</h2>
        <p>This is your dark mode dashboard with a collapsible sidebar.</p>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Smooth sidebar sliding */
aside {
  transition: transform 0.3s ease;
}
</style>
