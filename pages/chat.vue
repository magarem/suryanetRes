<template>
  <div class="flex bg-slate-900 text-slate-200 font-sans">

    <aside
      class="h-full flex-col border-r border-slate-800 transition-all duration-300"
      :class="['w-full md:w-1/4 lg:w-1/5', selectedUser.id && width < 768 ? 'hidden' : 'flex']"
    >
      <header class="p-4 border-b border-slate-800">
        <h2 class="text-xl font-bold">Contatos</h2>
      </header>
      <div class="flex-1 overflow-y-auto">
        <ul class="p-2">
          <li
            v-for="user in users"
            :key="user.id"
            @click="selectUser(user)"
            class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-800/50"
            :class="{ 'bg-sky-500/10 text-sky-400': user.id === selectedUser.id }"
          >
            <div class="relative">
              <AvatarImage :username="user?.username" :name="user?.name" size="small" />
              <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-slate-800"></span>
            </div>
            <span class="font-medium truncate">{{ user.name || 'Usuário ' + user.id }}</span>
          </li>
        </ul>
      </div>
    </aside>

    <main
      class="h-147 flex flex-col"  :class="['w-full md:w-3/4 lg:w-4/5', !selectedUser.id && width < 768 ? 'hidden' : 'flex']"
    >
      <div v-if="!selectedUser.id" class="flex flex-col items-center justify-center h-full text-slate-500">
        <i class="pi pi-comments text-6xl mb-4"></i>
        <h2 class="text-2xl font-medium">Selecione uma conversa</h2>
        <p>Comece a conversar com seus contatos.</p>
      </div>

      <template v-else>
        <header class="flex-shrink-0 flex items-center gap-4 p-3 border-b border-slate-800 bg-slate-900/70 backdrop-blur-sm">
          <Button
            v-if="width < 768"
            icon="pi pi-arrow-left"
            text
            rounded
            class="text-slate-400 hover:text-white"
            @click="selectedUser = {}"
          />
          <AvatarImage :username="selectedUser?.username" :name="selectedUser?.name" />
          <h1 class="text-lg font-bold truncate">{{ selectedUser?.name || '...' }}</h1>
        </header>

        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-xs md:max-w-md lg:max-w-xl px-4 py-3 rounded-xl"
              :class="msg.sender_id === currentUser.id ? 'bg-sky-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'"
            >
              <p class="break-words">{{ msg.body }}</p>
              <div class="text-right text-xs mt-1" :class="msg.sender_id === currentUser.id ? 'text-sky-200' : 'text-slate-400'">
                {{ new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
              </div>
            </div>
          </div>
        </div>

        <footer class="flex-shrink-0 p-4 border-t border-slate-800">
          <form @submit.prevent="send" class="flex items-center gap-3">
            <InputGroup class="flex-1">
              <InputText
                v-model="newMessage"
                placeholder="Digite sua mensagem..."
                class="flex-1 bg-slate-800 border-slate-700 focus:ring-2 focus:ring-sky-500/50"
                autocomplete="off"
              />
              <Button
                type="submit"
                icon="pi pi-send"
                severity="info"
                :disabled="!newMessage.trim()"
              />
            </InputGroup>
          </form>
        </footer>
      </template>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import AvatarImage from '@/components/AvatarImage.vue'

const { user: currentUser } = useUserSession()
const { width } = useWindowSize()

const users = ref([])
const selectedUser = ref({})
const messages = ref([])
const newMessage = ref('')
const chatContainer = ref(null)
let ws

// Lógica para carregar usuários
async function loadUsers() {
  try {
    const res = await fetch('/api/user/all');
    if (!res.ok) throw new Error('Falha ao carregar usuários');
    const json = await res.json();
    users.value = json.filter(u => u.id !== currentUser.value.id);
  } catch (error) {
    console.error('Erro em loadUsers:', error);
  }
}

// Seleciona usuário e carrega mensagens
async function selectUser(user) {
  if (selectedUser.value.id === user.id) return;
  selectedUser.value = user;
  messages.value = [];
  await fetchMessages(user.id);
}

// Busca o histórico de mensagens
async function fetchMessages(userId) {
  try {
    const { data, error } = await useFetch(`/api/chat/history/${userId}`);
    if (error.value) throw error.value;
    messages.value = data.value || [];
  } catch (error) {
    console.error('Erro em fetchMessages:', error);
  }
}

// Rola para o final do chat
async function scrollToBottom() {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

// Envia uma nova mensagem
async function send() {
  if (!newMessage.value.trim() || !selectedUser.value.id) return;

  const messagePayload = {
    type: 'chat:sendMessage',
    to: selectedUser.value.id,
    body: newMessage.value
  };

  const optimisticMessage = {
    id: Date.now(),
    sender_id: currentUser.value.id,
    receiver_id: selectedUser.value.id,
    body: newMessage.value,
    timestamp: new Date().toISOString()
  };
  messages.value.push(optimisticMessage);
  
  const messageToSend = newMessage.value;
  newMessage.value = '';

  try {
    ws.send(JSON.stringify(messagePayload));
    await useFetch('/api/chat/send', {
      method: 'POST',
      body: { to: selectedUser.value.id, body: messageToSend }
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

// Inicializa a conexão WebSocket
function setupWebSocket() {
  ws = new WebSocket('wss://suryanet.site/ws/');

  ws.onopen = () => {
    console.log('WebSocket conectado');
    ws.send(JSON.stringify({ type: 'identify', userId: currentUser.value.id }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    
    if (msg.type === 'chat:newMessage') {
      const isFromSelectedUser = msg.from === selectedUser.value.id;
      const isToCurrentUser = msg.to === currentUser.value.id;

      if (isFromSelectedUser && isToCurrentUser) {
        messages.value.push({
          id: msg.id || Date.now(),
          sender_id: msg.from,
          receiver_id: msg.to,
          body: msg.body,
          timestamp: msg.timestamp || new Date().toISOString()
        });
      } else {
        console.log('Nova mensagem recebida de:', msg.from);
      }
    }
  };

  ws.onerror = (err) => console.error('WebSocket error:', err);
  ws.onclose = () => console.log('WebSocket desconectado');
}

onMounted(async () => {
  await loadUsers();
  setupWebSocket();
});

watch(messages, scrollToBottom, { deep: true });
watch(selectedUser, scrollToBottom);
</script>