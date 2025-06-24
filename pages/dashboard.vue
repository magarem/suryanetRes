<script setup>
import { ref } from 'vue'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">

    <!-- Sidebar -->
    <div :class="['fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out', { '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }]" class="md:relative md:translate-x-0">
      <div class="p-4 text-2xl font-bold border-b">My Dashboard</div>
      <nav class="p-4 space-y-4">
        <a href="#" class="block hover:text-blue-500">Home</a>
        <a href="#" class="block hover:text-blue-500">Profile</a>
        <a href="#" class="block hover:text-blue-500">Settings</a>
      </nav>
    </div>

    <!-- Overlay for mobile -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" @click="toggleSidebar"></div>

    <!-- Main Content -->
    <div class="flex flex-col flex-1">
      <!-- Topbar -->
      <header class="flex items-center justify-between bg-white p-4 shadow-md">
        <button @click="toggleSidebar" class="md:hidden">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <h1 class="text-xl font-bold">Dashboard</h1>
        <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <h2 class="text-2xl font-bold mb-4">Welcome to the Dashboard</h2>
        <p>This is your main content area. You can put charts, tables, and more here.</p>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Optional: Smooth sidebar slide */
</style>
