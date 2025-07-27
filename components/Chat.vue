<template>
  <Card class="w-full max-w-2xl mx-auto shadow-2xl">
    <template #title>
      <div class="flex items-center gap-3">
        <i class="pi pi-comments text-primary-500" style="font-size: 2rem"></i>
        <span>Chat Room: {{ room }}</span>
      </div>
    </template>
    <template #content>
      <ScrollPanel ref="scrollPanel" style="width: 100%; height: 400px" class="p-2 border rounded">
        <div v-for="msg in messages" :key="msg.id" class="mb-2">
          <div :class="['p-2 rounded-lg max-w-xs', msg.user === user ? 'bg-primary-100 ml-auto' : 'bg-surface-100']">
            <p class="text-sm font-bold">{{ msg.user }}</p>
            <p>{{ msg.text }}</p>
            <p class="text-xs text-surface-500 text-right">{{ new Date(msg.timestamp).toLocaleTimeString() }}</p>
          </div>
        </div>
      </ScrollPanel>
    </template>
    <template #footer>
      <div class="flex gap-2">
        <InputText
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Digite sua mensagem..."
          class="flex-grow"
        />
        <Button icon="pi pi-send" @click="sendMessage" :disabled="!newMessage.trim()" />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { io, type Socket } from 'socket.io-client'
import Card from 'primevue/card'
import ScrollPanel from 'primevue/scrollpanel'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

// --- Props e Refs ---
const props = defineProps({
  room: { type: String, required: true, default: 'general' },
  user: { type: String, required: true, default: 'Anonymous' }
})

const messages = ref<any[]>([])
const newMessage = ref('')
const scrollPanel = ref<ScrollPanel | null>(null)
let socket: Socket | null = null

// --- Funções ---
const scrollToBottom = () => {
  nextTick(() => {
    // Acessa o elemento de conteúdo do ScrollPanel e rola para o final
    const content = scrollPanel.value?.$el.querySelector('.p-scrollpanel-content');
    if (content) {
      content.scrollTop = content.scrollHeight;
    }
  })
}

const sendMessage = () => {
  if (newMessage.value.trim() && socket) {
    socket.emit('send_message', {
      room: props.room,
      user: props.user,
      text: newMessage.value
    })
    newMessage.value = ''
  }
}

// --- Hooks do Ciclo de Vida ---
onMounted(async () => {
  // 1. Buscar o histórico de mensagens
  try {
    const history = await $fetch(`/api/messages/${props.room}`)
    messages.value = history as any[]
    scrollToBottom()
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
  }

  // 2. Conectar ao Socket.IO
  socket = io()

  socket.on('connect', () => {
    console.log('Conectado ao servidor de chat!', socket?.id)
    // Entra na sala especificada
    socket?.emit('join_room', props.room)
  })

  // 3. Escutar por novas mensagens
  socket.on('receive_message', (message) => {
    messages.value.push(message)
    scrollToBottom()
  })
})

onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect()
  }
})
</script>

<style>
/* Pequenos ajustes para o scrollpanel do PrimeVue */
.p-scrollpanel-content {
  padding-right: 18px; /* Evita que o texto fique sob a barra de rolagem */
}
</style>