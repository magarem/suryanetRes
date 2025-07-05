<template>
  <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
    <div class="p-5 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
        <Megaphone class="h-6 w-6 mr-3 text-indigo-500" />
        Notice Board
      </h3>
    </div>
    
    <!-- Loading State -->
    <div v-if="pending" class="p-5 text-center text-gray-500 dark:text-gray-400">
      <p>Loading notices...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-5 text-center text-red-500">
      <p>Could not load notices. Please try again later.</p>
    </div>

    <!-- Notices List -->
    <ul v-else-if="notices && notices.length" class="divide-y divide-gray-200 dark:divide-gray-700">
      <li v-for="notice in notices" :key="notice.id" class="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 ease-in-out">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
              <UserCircle class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ notice.title }}</h4>
            <p class="mt-1 text-base text-gray-600 dark:text-gray-300">{{ notice.content }}</p>
            <div class="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span class="font-medium">{{ notice.authorName || 'System' }}</span>
              <span class="mx-2">&middot;</span>
              <span>{{ notice.createdAt }}</span>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <!-- Empty State -->
    <div v-else class="p-5 text-center text-gray-500 dark:text-gray-400">
      <p>No notices relevant to your role at this time.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Megaphone, UserCircle } from 'lucide-vue-next';

// 1. Get the user session, which includes the user's roles
const { user } = useUserSession();

// 2. Create a reactive computed property for the user's roles
const userRoles = computed(() => user.value?.roles || []);

// 3. Fetch notices using a reactive URL that includes the roles.
// `useFetch` will automatically re-run this when userRoles changes.
const { data: notices, pending, error } = await useFetch(() => {
    // If there are no roles, don't make the request.
    if (!userRoles.value || userRoles.value.length === 0) {
      return null;
    }
    
    // Construct the query string from the roles array.
    // E.g., ['admin', 'editor'] becomes 'roles=admin&roles=editor'
    const queryParams = new URLSearchParams();
    userRoles.value.forEach(role => queryParams.append('roles', role));
    
    return `/api/notices?${queryParams.toString()}`;
  }, 
  { 
    // This makes the fetcher watch the computed property for changes.
    watch: [userRoles] 
  }
);
</script>
