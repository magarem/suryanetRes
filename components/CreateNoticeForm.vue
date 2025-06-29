<template>
  <div class="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <h3 class="text-xl font-semibold text-gray-100 mb-6">Create New Notice</h3>
    
    <div v-if="successMessage" class="mb-4 p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">
      {{ errorMessage }}
    </div>
    
    <form @submit.prevent="submitNotice" class="space-y-6">
     
      <div>
        <label for="notice-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
        <textarea v-model="form.content" id="notice-content" rows="4" required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700"></textarea>
      </div>

      <div>
        <label for="notice-roles" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Visible To Roles</label>
        <!-- This could be a PrimeVue MultiSelect component -->
        <select v-model="form.roleIds" id="notice-roles" multiple required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 h-32">
          <option v-for="role in availableRoles" :key="role.id" :value="role.id">{{ role.name }}</option>
        </select>
        <p class="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
      </div>

      <div class="flex justify-end space-x-4">
        <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
          Cancel
        </button>
        <button type="submit" :disabled="isLoading" class="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
          {{ isLoading ? 'Submitting...' : 'Submit Notice' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const emit = defineEmits(['close', 'noticeCreated']);

// Fetch available roles to populate the multi-select
const { data: availableRoles } = await useFetch('/api/roles');

const form = reactive({
  content: '',
  roleIds: [],
});

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

async function submitNotice() {
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await $fetch('/api/notices', {
      method: 'POST',
      body: form,
    });

    successMessage.value = 'Notice created successfully!';
    // Reset form
    form.content = '';
    form.roleIds = [];
    
    // Notify parent to refresh the notice board
    emit('noticeCreated');

    // Hide success message and close form after a delay
    setTimeout(() => {
        successMessage.value = '';
        emit('close');
    }, 2000);

  } catch (err) {
    errorMessage.value = 'An error occurred. Please try again.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}
</script>
