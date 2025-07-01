<template>
  <div _class="p-4 max-w-4xl mx-auto">
    <!-- <h1 class="text-2xl font-bold mb-6">Dashboard</h1> -->
    <!-- Show form only if the user has permission -->
   
    <!-- Notices visible to this user's roles -->
    <SuperCard title="Quadro de avisos" class="mb-6">
      <NoticeBoardList :notices="notices" />
    </SuperCard>
   
    <div v-if="canPost" class="mb-6">
      <SuperCard title="Criar aviso">
        <NoticeBoardForm @notice-created="loadNotices" />
      </SuperCard>
    </div>

   
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NoticeBoardForm from '@/components/noticeBoard/NoticeBoardForm.vue'
import NoticeBoardList from '@/components/noticeBoard/NoticeBoardList.vue'

function hasIntersection(arr1, arr2) {
  // Iterate over each element in the first array
  // If any element is found in the second array, 'some' returns true immediately.
  return arr1.some(item => arr2.includes(item));
}

const { data: user_data, error } = await useFetch('/api/showuser');


// Simulate logged-in user
const userRoles = ref(user_data.value.user.roles.split(',')) // Example: User has role_id 1 and 3
const canPost = hasIntersection(userRoles.value, ["4"]) // Set based on your auth logic




const notices = ref([])

async function loadNotices() {
  // Send user roles to the backend to filter the notices
  const res = await fetch('/api/notice-board?roles=' + userRoles.value.join(','))
  notices.value = await res.json()
}

onMounted(() => {
  loadNotices()
})
</script>
