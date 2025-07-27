<template>
  <div class="flex h-screen bg-gray-900 text-gray-100 font-sans">
    
    <!-- Sidebar -->
    <Sidebar :userAllowedPages="userAllowedPages" :is-open="isSidebarOpen" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col transition-all duration-300 ease-in-out" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
      <!-- Topbar -->
      <Topbar @toggle-sidebar="toggleSidebar" :is-sidebar-open="isSidebarOpen" />

      <!-- Page Content -->
      <main class="flex-1 p-1 overflow-y-auto">
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
const { width, height } = useWindowSize();
const isSidebarOpen = ref(true); // Open sidebar on larger screens
const { user, clear: clearSession } = useUserSession()
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};


// Define breakpoints
// const isMobile = computed(() => width.value < 768); // Telas menores que 768px
// const isLargeScreen = computed(() => !isMobile.value); // Telas maiores

// isSidebarOpen.value = isLargeScreen.value; // Open sidebar on larger screens
// if (width.value>500) {
//   // If the screen width is greater than 500px, open the sidebar
//   isSidebarOpen.value = true;
// } else {
//   // Otherwise, close the sidebar
//   isSidebarOpen.value = false;
// }

if (!user.value) {
  // If the user is not logged in, clear the session
  clearSession();
  // Optionally, you can redirect to the login page
  navigateTo('/login');
}
console.log('user', user.value);

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