<template>
  <div class="flex flex-col _min-h-screen bg-gray-900 text-white mb-5">
    <NoticeBoard/>
  </div>
  <div v-if="user.roles.includes(4)" class=" bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 border-gray-700">
  
    <h3 class="text-xl font-semibold text-white mb-6">Criar nova</h3>
  
    <div v-if="successMessage" class="mb-4 p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="submitNotice" class="space-y-6">

      <div>
        <label for="notice-content" class="block text-sm font-medium text-gray-300">Content</label>
        <textarea v-model="form.content" id="notice-content" rows="4" required class="mt-1 p-3 block w-full rounded-md border-gray-300 border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50 bg-gray-700"></textarea>
      </div>

      <div>
        <label for="notice-roles" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Visible To Roles</label>
        <!--
          This has been updated to use the PrimeVue MultiSelect component.
          - It's bound to form.roleIds.
          - It gets its options from the availableRoles fetched from the API.
          - optionLabel="name" displays the role name (e.g., "admin").
          - optionValue="id" uses the role's ID as the actual value when selected.
        -->
        <MultiSelect
          v-model="form.roleIds"
          :options="availableRoles"
          optionLabel="name"
          optionValue="id"
          placeholder="Select Roles"
          :maxSelectedLabels="3"
          class="w-full mt-1"
        />
      </div>

      <div class="flex justify-end space-x-4">
        <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
          Cancel
        </button>
        <button type="submit" :disabled="isLoading || form.roleIds.length === 0" class="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
          {{ isLoading ? 'Submitting...' : 'Submit Notice' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["authenticated"]
});
import { ref, reactive } from 'vue';
import NoticeBoard from '~/components/NoticeBoard.vue';
import { executeQuery } from "~/utils/db"; // Adjust the import path as necessary

// If PrimeVue components are not globally registered, you would import it like this:
// import MultiSelect from 'primevue/multiselect';
const { user, clear: clearSession } = useUserSession()
const { theme, toggleTheme } = useTheme();
const emit = defineEmits(['close', 'noticeCreated']);
const availableRoles = ref([]);
const loadRoles = async () => {
  try {
    const roles = await executeQuery('SELECT id, name FROM roles');
    return roles.map(role => ({ id: role.id, name: role.name }));
  } catch (error) {
    console.error('Error loading roles:', error);
    return [];
  }
};

const form = reactive({
  content: '',
  roleIds: [],
});

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

onMounted(async () => {
  // Load available roles when the component is mounted
  availableRoles.value = await loadRoles();
}); 
async function submitNotice() {
  if (form.roleIds.length === 0) {
      errorMessage.value = 'Please select at least one role.';
      return;
  }

  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await $fetch('/api/notices', {
      method: 'POST',
      body: form,
    });

    successMessage.value = 'Notice created successfully!';
    // Reset form after successful submission
    form.content = '';
    form.roleIds = [];

    // Notify the parent component that a notice was created, so it can refresh the list
    emit('noticeCreated');

    // Hide the success message and close the form after a short delay
    setTimeout(() => {
        successMessage.value = '';
        emit('close');
    }, 2000);

  } catch (err) {
    errorMessage.value = 'An error occurred while creating the notice. Please try again.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}
</script>
