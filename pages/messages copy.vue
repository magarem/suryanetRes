<template>
  <div
    class="flex h-[calc(100vh-8rem)] bg-gray-800 rounded-xl overflow-hidden shadow-lg"
  >
    <!-- Message List Pane -->
    <div class="w-1/3 border-r border-gray-700 flex flex-col">
      <!-- Header -->
      <div
        class="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0"
      >
        <div class="relative">
          <select
            v-model="selectedMailbox"
            @change="onFolderChange"
            class="bg-gray-700 text-white text-xl font-bold rounded-lg py-2 pl-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value="inbox">Inbox</option>
            <option value="sent">Sent</option>
            <option value="trash">Trash</option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
          >
            <ChevronDown class="h-5 w-5" />
          </div>
        </div>
        <button
          @click="isComposeModalOpen = true"
          class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <Pencil class="h-5 w-5" />
          <span>Novo</span>
        </button>
      </div>

      <!-- Message List -->
      <div class="overflow-y-auto">
        <div
          v-for="message in filteredMessages"
          :key="message.id"
          @click="selectedMessage = message"
          class="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
          :class="{
            'bg-gray-700/80':
              selectedMessage && selectedMessage.id === message.id
          }"
        >
          <div class="flex justify-between items-start">
            <p class="font-bold text-white truncate">{{ message.sender }}</p>
            <p class="text-xs text-gray-400 flex-shrink-0 ml-2">
              {{ message.time }}
            </p>
          </div>
          <p class="text-sm text-gray-300 font-semibold truncate mt-1">
            {{ message.subject }}
          </p>
          <p class="text-sm text-gray-400 truncate mt-1">
            {{ message.snippet }}
          </p>
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
              <img
                :src="selectedMessage.avatar"
                class="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 class="text-lg font-bold text-white">
                  {{ selectedMessage.sender }}
                </h3>
                <p class="text-sm text-gray-400">
                  to {{ selectedMessage.to || "me" }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="p-2 rounded-lg hover:bg-gray-700">
                <CornerUpLeft class="h-5 w-5 text-gray-400" />
              </button>
              <button class="p-2 rounded-lg hover:bg-gray-700">
                <CornerUpRight class="h-5 w-5 text-gray-400" />
              </button>
              <button class="p-2 rounded-lg hover:bg-gray-700">
                <Trash2 class="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-white mt-4">
            {{ selectedMessage.subject }}
          </h2>
        </div>

        <!-- Message Body -->
        <!-- <div
          class="p-6 overflow-y-auto flex-1"
          v-html="selectedMessage.body"
        ></div> -->

        <div class="p-6 overflow-y-auto flex-1 whitespace-pre-line text-white">
          {{ selectedMessage.body }}
        </div>

        <!-- Reply Box -->
        <div
          v-if="selectedMailbox === 'inbox'"
          class="p-4 border-t border-gray-700 flex-shrink-0"
        >
          <!-- <input type="text" :value="selectedMessage.sender" v-model="messageCompose.to" /> -->
          <textarea
            placeholder="Click here to reply..."
            v-model="messageCompose.body"
            class="w-full bg-gray-700 border border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              @click="replyMessage(selectedMessage.sender)"
              class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <span>Enviar</span>
              <Send class="h-5 w-5" />
            </button>
          </div>
        </div>
      </template>
      <div
        v-else
        class="flex flex-col items-center justify-center h-full text-gray-500"
      >
        <Mail class="h-24 w-24" />
        <p class="mt-4 text-lg">Select a message to read</p>
        <p class="text-sm">
          or
          <button
            @click="isComposeModalOpen = true"
            class="text-indigo-400 hover:underline"
          >
            compose a new one</button
          >.
        </p>
      </div>
    </div>

    <!-- Compose Modal -->
    <transition name="modal-fade">
      <div
        v-if="isComposeModalOpen"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      >
        <div
          class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 border border-gray-700"
        >
          <div
            class="p-4 border-b border-gray-700 flex justify-between items-center"
          >
            <h3 class="text-xl font-bold text-white">Nova mensagem</h3>
            <button
              @click="isComposeModalOpen = false"
              class="p-2 rounded-full hover:bg-gray-700"
            >
              <X class="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <div class="p-6">
            <input
              type="text"
              v-model="messageCompose.to"
              placeholder="Para"
              class="w-full bg-gray-700 p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              v-model="messageCompose.subject"
              placeholder="Assunto"
              class="w-full bg-gray-700 p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              v-model="messageCompose.body"
              placeholder="Mensagem..."
              class="w-full bg-gray-700 p-2 rounded-lg mb-4 h-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>
          <div class="p-4 border-t border-gray-700 flex justify-end">
            <button
              @click="sendMessage"
              class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <span>Enviar</span>
              <Send class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import {
  Pencil,
  Mail,
  CornerUpLeft,
  CornerUpRight,
  Trash2,
  Send,
  X,
  ChevronDown
} from "lucide-vue-next";

const { user: currentUser, clear: clearSession } = useUserSession();
// Modal state
const isComposeModalOpen = ref(false);
const selectedMailbox = ref("inbox"); // 'inbox', 'sent', 'trash'
// Mock message data for all folders
const emails = ref([]);

const messageCompose = ref({ to: "", subject: "", body: "" });
// Initialize with empty array
const allMessages = ref([]);
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
const innerWidth = ref(0);
const usersList = ref([]);
const isSmallScreen = computed(() => innerWidth.value < 500);
const toast = useToast();
let websocket = null;

const updateInnerWidth = () => {
  innerWidth.value = window.innerWidth;
};

// A computed property to get messages for the active folder
const filteredMessages = computed(() => {
  return allMessages.value.filter(m => m.folder === selectedMailbox.value);
});

// Reactive state for the selected message
const selectedMessage = ref(filteredMessages.value[0] || null);

// Function to handle folder switching
const onFolderChange = () => {
  selectedMessage.value = null; // Clear selection when switching folders
};

async function fetchUsers() {
  try {
    const response = await fetch(`/api/user/all`); // Create this API endpoint
    const data = await response.json();
    if (Array.isArray(data)) {
      usersList.value = data;
    } else {
      console.error("Failed to fetch users:", data);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

const checkImageExists = async url => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) {
      return url;
    } else {
      return `https://placehold.co/100x100/eab308/4338ca?text='U'`;
    }
  } catch (error) {
    console.error("Error checking image existence:", error);
    return `https://placehold.co/100x100/eab308/4338ca?text='U'`;
  }
};

async function fetchEmails() {
  if (selectedMailbox.value) {
    try {
      let apiUrl = `/api/messages/${selectedMailbox.value}/messages?userId=${currentUser.value.id}`;

      // Add a query parameter to explicitly request non-deleted emails
      if (selectedMailbox.value !== "deleted") {
        apiUrl += "&excludeDeleted=true"; // Or a similar parameter
      }

      console.log("Fetching emails from:", apiUrl);

      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log("Fetched emails:", data);
      if (Array.isArray(data)) {
        emails.value = data;
      } else {
        console.error("Failed to fetch emails:", data);
        emails.value = [];
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      emails.value = [];
    }
  } else {
    emails.value = [];
  }
  const emailPromises = emails.value.map(async email => {
    console.log("Processing email:", email);
    
    return {
      ...email,
      date: format(new Date(email.date), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
      avatar: await checkImageExists(
        `api/uploads/${email.senderName}/avatar.png?${Date.now()}`
      )
    };
  });

  // Wait for all promises in the array to resolve
  emails.value = await Promise.all(emailPromises);
  console.log("emails.value:", emails.value);

  allMessages.value = emails.value.map(item => {
    return {
      id: item.id,
      folder: "inbox",
      sender: item.senderName,
      avatar: item.avatar,
      subject: item.subject,
      snippet: item.body.slice(0, 100) + "...",
      time: item.date,
      body: item.body.replace(/<[^>]+>/g, "") // Remove HTML tags for snippet
    };
  });
}

onBeforeMount(async () => {
  //  innerWidth.value = window.innerWidth
  await fetchUsers();
  await fetchEmails();

  if (typeof window !== "undefined") {
    // Check if running on the client-side
    updateInnerWidth();
    // window.addEventListener('resize', updateInnerWidth);
  }
});

onMounted(() => {
  // console.log("sortedEmails", sortedEmails.value);

  websocket = new WebSocket("wss://suryanet.site/ws/"); // Endereço do seu servidor WebSocket

  websocket.onopen = async () => {
    console.log("Conectado ao WebSocket.");
  };

  websocket.onmessage = async event => {
    try {
      const data = JSON.parse(event.data);
      if (data && data.type == "newMail") {
        if (data.receiverId == currentUser.value.id) {
          await fetchEmails();
        }
      }
    } catch (error) {
      console.error("Erro ao processar mensagem WebSocket:", error);
    }
  };

  websocket.onclose = () => {
    console.log("Desconectado do WebSocket.");
    // Lógica para reconectar se necessário
  };

  websocket.onerror = error => {
    console.error("Erro no WebSocket:", error);
  };
});

async function replyMessage(to) {
  const formattedDate = format(new Date(selectedMessage.value.time), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })

  messageCompose.value.to = to;
  messageCompose.value.subject = "Re: " + selectedMessage.value.subject;
  messageCompose.value.body = selectedMessage.value.body + "\n\n----------- Enviada em: " + formattedDate + " ---------------- Por: " + currentUser.value.username + " \n\n" + messageCompose.value.body;

  // sending.value = true
  // success.value = false
  // error.value = null
  isComposeModalOpen.value = false;
  const { data: userData, error: userErr } = await useFetch(
    "/api/user/username:" + messageCompose.value.to,
    {
      method: "GET",
      key: `user-${messageCompose.value.to}`
    }
  );

  // if (userErr.value || !userData.value?.id) {
  //   // error.value = "Destinatário não encontrado";
  //   sending.value = false;
  //   return;
  // }
  console.log("message data", {
    senderId: currentUser.value.id,
    receiverId: userData.value?.id,
    subject: messageCompose.value.subject,
    body: messageCompose.value.body
  });

  const { data, error: fetchError } = await useFetch("/api/messages/send", {
    method: "POST",
    body: {
      senderId: currentUser.value.id,
      receiverId: userData.value?.id,
      subject: messageCompose.value.subject,
      body: messageCompose.value.body
    }
  });

  if (fetchError.value) {
    console.error("Erro ao enviar mensagem:", fetchError.value);
    // error.value = fetchError.value?.data?.message || "Erro desconhecido";
  } else {
    toast.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Ok",
      life: 3000
    });
    messageCompose.value = { to: "", subject: "", body: "" };
  }
}

async function sendMessage() {
  // sending.value = true
  // success.value = false
  // error.value = null
  isComposeModalOpen.value = false;
  const { data: userData, error: userErr } = await useFetch(
    "/api/user/username:" + messageCompose.value.to,
    {
      method: "GET",
      key: `user-${messageCompose.value.to}`
    }
  );

  // if (userErr.value || !userData.value?.id) {
  //   // error.value = "Destinatário não encontrado";
  //   sending.value = false;
  //   return;
  // }
  console.log("message data", {
    senderId: currentUser.value.id,
    receiverId: userData.value?.id,
    subject: messageCompose.value.subject,
    body: messageCompose.value.body
  });

  const { data, error: fetchError } = await useFetch("/api/messages/send", {
    method: "POST",
    body: {
      senderId: currentUser.value.id,
      receiverId: userData.value?.id,
      subject: messageCompose.value.subject,
      body: messageCompose.value.body
    }
  });

  if (fetchError.value) {
    console.error("Erro ao enviar mensagem:", fetchError.value);
    // error.value = fetchError.value?.data?.message || "Erro desconhecido";
  } else {
    toast.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Ok",
      life: 3000
    });
    messageCompose.value = { to: "", subject: "", body: "" };
  }
}
</script>

<style>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
