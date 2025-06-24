<template>
  <div class="flex h-[calc(100vh-8rem)] bg-gray-800 rounded-xl overflow-hidden shadow-lg">
    
    <!-- Message List Pane -->
    <div class="w-1/3 border-r border-gray-700 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
        <div class="relative">
            <select v-model="activeFolder" @change="onFolderChange" class="bg-gray-700 text-white text-xl font-bold rounded-lg py-2 pl-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                <option value="inbox">Inbox</option>
                <option value="sent">Sent</option>
                <option value="trash">Trash</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown class="h-5 w-5" />
            </div>
        </div>
        <button @click="isComposeModalOpen = true" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          <Pencil class="h-5 w-5" />
          <span>Compose</span>
        </button>
      </div>
      
      <!-- Message List -->
      <div class="overflow-y-auto">
        <div v-for="message in filteredMessages" :key="message.id" 
             @click="selectedMessage = message"
             class="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
             :class="{'bg-gray-700/80': selectedMessage && selectedMessage.id === message.id}">
          <div class="flex justify-between items-start">
            <p class="font-bold text-white truncate">{{ message.sender }}</p>
            <p class="text-xs text-gray-400 flex-shrink-0 ml-2">{{ message.time }}</p>
          </div>
          <p class="text-sm text-gray-300 font-semibold truncate mt-1">{{ message.subject }}</p>
          <p class="text-sm text-gray-400 truncate mt-1">{{ message.snippet }}</p>
        </div>
      </div>
    </div>

    <!-- Message View Pane -->
    <div class="w-2/3 flex flex-col">
      <template v-if="selectedMessage">
        <!-- Header -->
        <div class="p-4 border-b border-gray-700 flex-shrink-0">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <img :src="selectedMessage.avatar" class="h-12 w-12 rounded-full object-cover">
                    <div>
                        <h3 class="text-lg font-bold text-white">{{ selectedMessage.sender }}</h3>
                        <p class="text-sm text-gray-400">to {{ selectedMessage.to || 'me' }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="p-2 rounded-lg hover:bg-gray-700"><CornerUpLeft class="h-5 w-5 text-gray-400"/></button>
                    <button class="p-2 rounded-lg hover:bg-gray-700"><CornerUpRight class="h-5 w-5 text-gray-400"/></button>
                    <button class="p-2 rounded-lg hover:bg-gray-700"><Trash2 class="h-5 w-5 text-gray-400"/></button>
                </div>
            </div>
             <h2 class="text-2xl font-bold text-white mt-4">{{ selectedMessage.subject }}</h2>
        </div>

        <!-- Message Body -->
        <div class="p-6 overflow-y-auto flex-1" v-html="selectedMessage.body"></div>
        
        <!-- Reply Box -->
        <div v-if="activeFolder === 'inbox'" class="p-4 border-t border-gray-700 flex-shrink-0">
            <textarea placeholder="Click here to reply..." class="w-full bg-gray-700 border border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3"></textarea>
            <div class="flex justify-end mt-2">
                 <button class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    <span>Send</span>
                    <Send class="h-5 w-5" />
                </button>
            </div>
        </div>

      </template>
      <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
        <Mail class="h-24 w-24" />
        <p class="mt-4 text-lg">Select a message to read</p>
        <p class="text-sm">or <button @click="isComposeModalOpen = true" class="text-indigo-400 hover:underline">compose a new one</button>.</p>
      </div>
    </div>

    <!-- Compose Modal -->
     <transition name="modal-fade">
        <div v-if="isComposeModalOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 border border-gray-700">
                <div class="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 class="text-xl font-bold text-white">New Message</h3>
                    <button @click="isComposeModalOpen = false" class="p-2 rounded-full hover:bg-gray-700">
                        <X class="h-6 w-6 text-gray-400" />
                    </button>
                </div>
                <div class="p-6">
                    <input type="text" placeholder="To" class="w-full bg-gray-700 p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <input type="text" placeholder="Subject" class="w-full bg-gray-700 p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <textarea placeholder="Your message..." class="w-full bg-gray-700 p-2 rounded-lg mb-4 h-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
                <div class="p-4 border-t border-gray-700 flex justify-end">
                    <button @click="isComposeModalOpen = false" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        <span>Send Message</span>
                        <Send class="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Pencil, Mail, CornerUpLeft, CornerUpRight, Trash2, Send, X, ChevronDown } from 'lucide-vue-next';

// Modal state
const isComposeModalOpen = ref(false);
const activeFolder = ref('inbox'); // 'inbox', 'sent', 'trash'

// Mock message data for all folders
const allMessages = ref([
  {
    id: 1,
    folder: 'inbox',
    sender: 'Sarah Johnson',
    avatar: 'https://placehold.co/100x100/eab308/4338ca?text=SJ',
    subject: 'Project Phoenix Update',
    snippet: 'Hey team, just wanted to share the latest updates on Project Phoenix. The client is happy with the progress...',
    time: '2:45 PM',
    body: `<p>Hey team,</p><p>Just wanted to share the latest updates on <strong>Project Phoenix</strong>. The client is happy with the progress we've made this week.</p><p>Please review the attached document and provide your feedback by end of day tomorrow.</p><p>Best,<br>Sarah</p>`
  },
  {
    id: 2,
    folder: 'inbox',
    sender: 'GitHub',
    avatar: 'https://placehold.co/100x100/10b981/1e293b?text=G',
    subject: '[NuxtDash] Your build has completed successfully',
    snippet: 'Your latest push to the main branch has been deployed. The build passed all checks and is now live.',
    time: '1:10 PM',
    body: `<p>Your latest push to the <code>main</code> branch has been deployed.</p><p>The build passed all checks and is now live. You can view the deployment details on the dashboard.</p>`
  },
  {
    id: 3,
    folder: 'inbox',
    sender: 'Alex Green',
    avatar: 'https://placehold.co/100x100/38bdf8/1e293b?text=AG',
    subject: 'Lunch on Friday?',
    snippet: 'Are you free for lunch this Friday? I was thinking we could try that new Italian place downtown.',
    time: 'Yesterday',
    body: `<p>Hey!</p><p>Are you free for lunch this Friday? I was thinking we could try that new Italian place downtown that everyone's been talking about.</p><p>Let me know!</p><p>- Alex</p>`
  },
  {
    id: 4,
    folder: 'sent',
    sender: 'Me',
    to: 'Alex Green',
    avatar: 'https://placehold.co/100x100/6366f1/e0e7ff?text=JD',
    subject: 'Re: Lunch on Friday?',
    snippet: "Hey Alex, Friday works for me! What time were you thinking? I'm excited to try it out.",
    time: '9:30 AM',
    body: `<p>Hey Alex,</p><p>Friday works for me! What time were you thinking? I'm excited to try it out.</p><p>Cheers,<br>John</p>`
  },
  {
    id: 5,
    folder: 'trash',
    sender: 'Sales Weekly',
    avatar: 'https://placehold.co/100x100/f43f5e/1e293b?text=S',
    subject: 'Don\'t miss out on these exclusive deals!',
    snippet: 'The best deals of the season are here for a limited time. Shop now and save up to 50% on select items.',
    time: 'Yesterday',
    body: `<p>The best deals of the season are here for a limited time. Shop now and save up to 50% on select items.</p>`
  }
]);

// A computed property to get messages for the active folder
const filteredMessages = computed(() => {
    return allMessages.value.filter(m => m.folder === activeFolder.value);
});


// Reactive state for the selected message
const selectedMessage = ref(filteredMessages.value[0] || null);

// Function to handle folder switching
const onFolderChange = () => {
    selectedMessage.value = null; // Clear selection when switching folders
};

</script>

<style>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
