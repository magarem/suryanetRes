<template>
  <div class="flex h-screen bg-gray-900 text-gray-100 font-sans">
    <!-- Sidebar -->
    <Sidebar :is-open="isSidebarOpen" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col transition-all duration-300 ease-in-out" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
      <!-- Topbar -->
      <Topbar @toggle-sidebar="toggleSidebar" :is-sidebar-open="isSidebarOpen" />

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-y-auto">
        <!-- NuxtPage will render the content of your pages -->
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '~/components/Sidebar.vue';
import Topbar from '~/components/Topbar.vue';

// Reactive state for the sidebar's visibility
const isSidebarOpen = ref(true);

// Function to toggle the sidebar state
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<style>
/* Basic styles to ensure a clean look */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
}
/* Smooth transition for margin-left on the main content */
.transition-all {
  transition-property: all;
}
.duration-300 {
  transition-duration: 300ms;
}
.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
