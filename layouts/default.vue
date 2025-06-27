<template>
  <div class="flex h-screen bg-gray-900 text-gray-100 font-sans">
    
    <!-- Sidebar -->
    <Sidebar :userAllowedPages="userAllowedPages" :is-open="isSidebarOpen" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col transition-all duration-300 ease-in-out" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
      <!-- Topbar -->
      <Topbar @toggle-sidebar="toggleSidebar" :is-sidebar-open="isSidebarOpen" />

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-y-auto">
        <!-- THE ONLY CHANGE IS HERE -->
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
// The script block remains the same
import { ref } from 'vue';
import Sidebar from '~/components/Sidebar.vue';
import Topbar from '~/components/Topbar.vue';

const isSidebarOpen = ref(true);
const { user, clear: clearSession } = useUserSession()
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const { data: userAllowedPages, pending, error } = await useFetch(`/api/navigation?userId=${user.value.id}`, {
  // useFetch is a convenient wrapper around useAsyncData
  // It automatically generates a key based on the URL
});


</script>

<style>
/* The style block remains the same */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
}
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