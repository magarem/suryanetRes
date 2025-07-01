<template>
  <div style="margin: 0 -20px 0 -20px;" class="grid md:grid-cols-3 lg:grid-cols-3 gap-4">
    <div
      :class="{ hidden: selectedEmail && isSmallScreen }"
      class="col-span-1"
      __class=" bg-gray-900 border-r border-gray-700 p-4 flex flex-col"
    >
    <div class="flex justify-between items-center mb-4 px-2 space-x-2">
  <span class="text-[18px] font-semibold whitespace-nowrap">Caixa postal</span>

  <Dropdown
    id="to"
    v-model="selectedMailbox"
    @change="selectMailbox"
    :options="mailboxes"
    optionLabel="name"
    optionValue="name"
    placeholder="Selecione"
    class="bg-gray-700 text-white border-gray-600 text-sm"
    style="min-width: 110px;"
  />

  <Button
    icon="pi pi-plus"
    class="p-button-sm p-button-primary"
    @click="openModal"
  />
</div>

      <ul class="overflow-y-auto h-[calc(100vh - 180px)]">
        <li
          v-for="email in sortedEmails"
          :key="email.id"
          @click="selectEmail(email)"
          :class="[
            'p-3 rounded cursor-pointer ',
            selectedEmail?.id === email.id
              ? 'bg-blue-900 text-blue-300'
              : 'hover:bg-gray-800',
            !email.isRead ? 'font-semibold' : 'text-gray-400',
            'flex items-start space-x-2'
          ]"
        >
          <Avatar
            :image="email.avatar"
            :label="getInitials(email.from)"
            class="mr-2"
            shape="circle"
            size="xlarge"
            style="width: 57px; height: 57px; margin-right: 10px;"
          />
          <div class="flex-grow" style="margin-top: -2px;">
            <div class="flex justify-between items-center">
              <span class="block text-[16px]">{{ email.senderName }}</span>
              <span class="text-xs text-[13px]">{{ formatDate(email.date) }}</span>
            </div>
            <span class="block text-sm font-light text-[13px]">{{ email.subject }}</span>
            <span class="block text-sm font-light text-[13px]">{{ email.body.substring(0, 30) }}{{ email.body.length > 30 ? '...' : '' }}</span>
          </div>
        </li>
        <li v-if="filteredEmails.length === 0" class="p-3 text-gray-500">
          <!-- <h5>Nenhuma mensagem aqui</h5> -->
        </li>
      </ul>
    </div>

    <div
      v-if="selectedEmail"
      class="md:col-span-2"
      __class=" bg-gray-900 border-l border-gray-700 p-4 flex flex-col"
    >
      <!-- <div class="flex justify-between items-center mb-1"> -->
        <!-- <Button
          icon="pi pi-arrow-left"
          class="p-button-rounded p-button-text text-white hover:bg-gray-700 mr-2"
          @click="selectedEmail = null"
        /> -->
        <div class="mb-3">
          <Button
            icon="pi pi-arrow-left"
            class="p-button-rounded p-button-text text-white hover:bg-gray-700 mr-0"
            @click="selectedEmail = false"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-text p-button-danger hover:bg-red-700"
            @click="deleteSelectedEmail"
          />
        </div>
      <!-- </div> -->
      <!-- <h3 class="text-xl font-semibold mb-0">{{ selectedEmail.subject }}</h3> -->
      <div class="text-gray-400 mb-2 bg-gray-800 p-2 rounded">
        <div class="mb-2">
          Assunto: {{ selectedEmail.subject }}
        </div> 
        <div class="mb-2">
          De: <span class="text-white">{{ selectedEmail.senderName }}</span>
        </div>
        <div class="mb-2">
          Para: <span class="text-white">{{ selectedEmail.receiverName }}</span>
        </div>
        <div>
          Data: <i>{{ formatDateLong(selectedEmail.date) }}</i>
        </div>
      </div>
      <div class="prose prose-sm text-gray-300">
        <div
          class="bg-gray-900 p-2 rounded"
          :style="{ whiteSpace: 'pre-line' }"
        >
          {{ selectedEmail.body }}
        </div>

        <!-- <hr class="border-gray-700 my-4"> -->
        <!-- <p>More email content could go here...</p> -->
        <!-- <Button
          icon="pi pi-arrow-left"
          label="Responder"
          class=" p-button-text text-white hover:bg-gray-700 mr-2"
          @click="handleReplyEmail"
        /> -->
        <div
          class="mt-2 bg-gray-800 p-2 rounded"
          v-if="selectedMailbox === 'inbox'"
        >
          <label for="body" class=" block text-gray-300 mb-1">Responder</label>
          <Textarea
            autofocus
            id="body"
            rows="7"
            v-model="composeEmail.body"
            class="w-full bg-red-50 text-white"
            ref="bodyTextarea"
          />
          <Button
            label="Enviar"
            class="p-button-primary mt-2"
            @click="handleReplyEmail_textarea"
          />
        </div>
      </div>
    </div>
    <!-- <aside v-else class="md:col-span-2 bg-gray-900 border-l border-gray-700 p-4 flex items-center justify-center text-gray-500 italic">
        Select an email to view its content.
      </aside> -->

      <Dialog
    v-model:visible="isComposing"
    modal
    :draggable="false"
    :closable="false"
    :breakpoints="{
    '1600px': '50vw',   /* Para telas muito grandes (ex: > 1600px), 50% da largura */
    '1200px': '60vw',   /* Para telas grandes (> 13 polegadas), 60% da largura */
    '960px': '80vw',    /* Para tablets e telas menores */
    '640px': '95vw',    /* Para celulares em modo paisagem */
    '0px': '100vw'      /* Para celulares em modo retrato */
  }"
  :style="{ maxHeight: '90vh' }"
    class="gmail-compose-dialog  no-padding"
  >
  <template #header>
  <div class="gmail-header">
    <div class="header-title">Nova mensagem</div>
    <div class="header-icons">
      <Button
        icon="pi pi-send"
        class="p-button-primary p-button-rounded p-button-sm send-icon-button"
        @click="handleSendNewEmail"
        aria-label="Enviar"
      />
      <Button
        icon="pi pi-times"
        class="p-button-text p-button-sm close-button"
        @click="isComposing = false"
        aria-label="Fechar"
      />
    </div>
  </div>
</template>

    <div class="gmail-compose-content">
      <Dropdown
        v-model="selectedRecipient"
        :options="usersList"
        optionLabel="nome"
        optionValue="id"
        placeholder="Para"
        class="gmail-input"
      />
      <InputText
        type="text"
        v-model="composeEmail.subject"
        placeholder="Assunto"
        class="gmail-input"
      />
      <Textarea
        autofocus
        rows="20"
        v-model="composeEmail.body"
        placeholder="Escreva sua mensagem..."
        class="gmail-textarea"
      />
    </div>
  </Dialog>
  </div>
</template>

<script setup>
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
const innerWidth = ref(0);
const isSmallScreen = computed(() => innerWidth.value < 500);
const toast = useToast();
const route = useRoute();
const domain = route.params.domain;
const bodyTextarea = ref(null);
let isReplyEmail = ref(false);
let replyEmailBody = ref("");
let websocket = null;
// Dummy Data (Replace with your actual data fetching)
const mailboxes = ref([
  { icon: "", name: "inbox" },
  { icon: "", name: "sent" },
  { icon: "", name: "drafts" },
  { icon: "", name: "deleted" }
]);
const labels = ref(["Important", "Work", "Personal"]);
const emails = ref([]);
const updateInnerWidth = () => {
  innerWidth.value = window.innerWidth;
};
const currentUser = ref(null);
const error = ref(null);

const selectedMailbox = ref("inbox");
const selectedEmail = ref(null);
const sortOption = ref("date-desc");
const sortOptions = ref([
  { label: "Date (Newest First)", value: "date-desc" },
  { label: "Date (Oldest First)", value: "date-asc" },
  { label: "From (A-Z)", value: "from-asc" },
  { label: "From (Z-A)", value: "from-desc" },
  { label: "Subject (A-Z)", value: "subject-asc" },
  { label: "Subject (Z-A)", value: "subject-desc" }
]);

var composeEmail = ref({
  from: "",
  to: "",
  subject: "",
  body: ""
});

const isComposing = ref(false);
const usersList = ref([]);
const selectedRecipient = ref(null);

function handleShow() {
  nextTick(() => {
    // bodyTextarea.value?.focus();
    // bodyTextarea.value.setSelectionRange(0, 0);
  });
}

const checkImageExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return url;
    } else {
      return '/avatar-default-icon.png';
    }
  } catch (error) {
    console.error('Error checking image existence:', error);
    return '/avatar-default-icon.png';
  }
};

watch(isComposing, async val => {
  if (val) {
    nextTick(() => {
      // bodyTextarea.value?.focus();
    });
  }
});

const filteredEmails = computed(() => {
  return emails.value.filter(email => {
    // In a real app, you'd filter based on the selectedMailbox
    return (
      selectedMailbox.value === "inbox" ||
      selectedMailbox.value === "sent" ||
      selectedMailbox.value === "drafts" ||
      selectedMailbox.value === "deleted"
    ); // Basic example
  });
});

async function handleReplyEmail_textarea() {
  isReplyEmail.value = true;

  selectedRecipient.value = selectedEmail.value.senderId;
  composeEmail.value.subject = `Re: ${selectedEmail.value.subject}`;
  handleSendNewEmail();
}

async function handleReplyEmail() {
  selectedRecipient.value = selectedEmail.value.senderId;
  composeEmail.value.subject = `Re: ${selectedEmail.value.subject}`;
  isComposing.value = true;
}

async function fetchUsers() {
  try {
    const response = await fetch(`/api/${domain}/users`); // Create this API endpoint
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

async function fetchUser() {
  try {
    const response = await fetch("/api/user");
    const data = await response.json();
    currentUser.value = data.user;
    error.value = data.error || null;
  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = "Failed to fetch user data.";
  }
}

async function fetchEmails() {
  if (selectedMailbox.value) {
    try {
      let apiUrl = `/api/${domain}/messages/${selectedMailbox.value}/messages?userId=${currentUser.value.id}`;

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
    return {
      ...email,
      avatar: await checkImageExists(`/api/${domain}/${email.senderName}/uploads/avatar.png`)
    };
  });

  // Wait for all promises in the array to resolve
  emails.value = await Promise.all(emailPromises);

  console.log("emails.value:", emails.value);

}

const sortedEmails = computed(() => {
  const emailsToSort = [...filteredEmails.value];
  switch (sortOption.value) {
    case "date-desc":
      return emailsToSort.sort((a, b) => new Date(b.date) - new Date(a.date));
    case "date-asc":
      return emailsToSort.sort((a, b) => new Date(a.date) - new Date(b.date));
    case "from-asc":
      return emailsToSort.sort((a, b) => a.from.localeCompare(b.from));
    case "from-desc":
      return emailsToSort.sort((a, b) => b.from.localeCompare(a.from));
    case "subject-asc":
      return emailsToSort.sort((a, b) => a.subject.localeCompare(b.subject));
    case "subject-desc":
      return emailsToSort.sort((a, b) => b.subject.localeCompare(a.subject));
    default:
      return emailsToSort;
  }
});

const selectMailbox = mailboxName => {
  //   selectedMailbox.value = mailboxName;
  selectedEmail.value = null; // Deselect email when switching mailboxes
  fetchEmails();
};

const selectEmail = async (email) => {
  console.log("email:", email);
  selectedEmail.value = email;
  replyEmailBody.value = `
  ------ respondendo a -------
  De:  ${selectedEmail.value.senderName}
  Para: ${selectedEmail.value.receiverName}
  Assunto: ${selectedEmail.value.subject}
  Em: ${formatDateLong(selectedEmail.value.date)}   
  
  ${selectedEmail.value.body}
  `;

  email.isRead = true; // Mark as read when selected (for UI purposes)

  console.log("selectedEmail.value:", selectedEmail.value);
  
  const { data, error: fetchError } = await useFetch(`/api/${domain}/messages/setMessageIsRead/${selectedEmail.value.id}`, {
    method: 'PUT',
  });

  console.log("data--->>>>>>>:", data.value);
};

const getInitials = name => {
  return name; //.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatDate = date => {
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
};

const formatDateLong = date => {
  return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
};

async function deleteSelectedEmail() {
  if (selectedEmail.value) {
    try {
      const sendVar = { userId: currentUser.value.id, mailbox: "deleted" };

      console.log("sendVar:", sendVar);
      const response = await fetch(
        `/api/${domain}/messages/delete/${selectedEmail.value.id}`,
        {
          method: "POST", // Or PUT, depending on your API design
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(sendVar) // Indicate the new mailbox
        }
      );

      if (response.ok) {
        console.log(`Email ${selectedEmail.value.id} moved to deleted.`);
        // Update the local emails array
        emails.value = emails.value.map(email => {
          if (email.id === selectedEmail.value.id) {
            return {
              ...email,
              mailbox: "deleted",
              isDeleted: true,
              deletedAt: new Date()
            };
          }
          return email;
        });
        selectedEmail.value = null; // Clear the selected email after deletion
        // Optionally, if the 'deleted' mailbox is currently viewed, you might want to refetch
        if (selectedMailbox.value !== "deleted") {
          // If not in the deleted box, you might want to remove it from the current view
          //   emails.value = emails.value.filter(
          //     email => email.id !== selectedEmail.value.id
          //   );
          await fetchEmails();
        } else {
          // If in the deleted box, the list should already reflect the change
          await fetchEmails(); // Or update the pagination/list if needed
        }
        toast.add({
          severity: "success",
          summary: "Mensagem excluída",
          detail: "Mensagem movida para itens excluídos",
          life: 3000
        });
      } else {
        const errorData = await response.json();
        console.error("Failed to move email to deleted:", errorData);
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error("Error moving email to deleted:", error);
      // Optionally show an error message to the user
    }
  }
}

const handleSendNewEmail = async () => {
  // if (!composeEmail.value.to || !composeEmail.value.subject || !composeEmail.value.body) {
  //   // Handle validation errors on the frontend
  //   return;
  // }
  let body = composeEmail.value.body;
  if (isReplyEmail.value) {
    isReplyEmail.value = false;
    body = composeEmail.value.body + "\n\n" + replyEmailBody.value;
  }

  const messageData = {
    senderId: currentUser.value.id,
    receiverId: selectedRecipient.value, // Assuming this is the receiver's ID
    subject: composeEmail.value.subject,
    body: body
  };

  console.log("messageData:", messageData);

  try {
    const response = await fetch(`/api/${domain}/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messageData)
    });

    const data = await response.json();
    console.log("response:", response);
    console.log("data:", data);

    if (response.ok && data.success) {
      console.log("Message sent and saved with ID:", data.messageId);
      // Optionally update your local UI (e.g., clear compose form, navigate to sent messages)
      composeEmail.value = { from: "", to: "", subject: "", body: "" };
      isComposing.value = false;

      toast.add({
        severity: "success",
        summary: "Mensagem enviado",
        detail: "Mensagem enviada com sucesso",
        life: 3000
      });

      // You might want to trigger a refetch of the 'Sent' mailbox messages
    } else {
      console.error("Failed to send message:", data);
      // Optionally display an error message to the user
    }
  } catch (error) {
    console.error("Error sending message:", error);
    // Optionally display an error message to the user
  }
};

function openModal() {
  isComposing.value = true;
  composeEmail.value.subject = "";
  composeEmail.value.body = "";
  nextTick(() => {
    // bodyTextarea.value?.focus();
    // bodyTextarea.value?.$el?.querySelector("textarea")?.focus()
  });
}


onBeforeMount(async () => {
  //  innerWidth.value = window.innerWidth
  await fetchUsers();
  await fetchUser();
  await fetchEmails();

  if (typeof window !== "undefined") {
    // Check if running on the client-side
    updateInnerWidth();
    // window.addEventListener('resize', updateInnerWidth);
  }
});

onMounted(() => {


  console.log("sortedEmails", sortedEmails.value);
  
  websocket = new WebSocket('wss://suryanet.site/ws/'); // Endereço do seu servidor WebSocket

  websocket.onopen = async () => {
    console.log('Conectado ao WebSocket.');
//     const { data, error: fetchError } = await useFetch(
//   `/api/${domain}/messages/totalUnreadMessages`,
//   {
//     method: "GET"
//   }
// );

// console.log("Total de mensagens não lidas:", data.value);

// unreadNotificationsCount.value = data.value;
  };

  websocket.onmessage = async (event) => {
    
    try {
      const data = JSON.parse(event.data);
      if (data && data.type == "newMail"){
        if (data.receiverId == currentUser.value.id) {
          await fetchEmails();
        }
      }
     
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  };

  websocket.onclose = () => {
    console.log('Desconectado do WebSocket.');
    // Lógica para reconectar se necessário
  };

  websocket.onerror = (error) => {
    console.error('Erro no WebSocket:', error);
  };
});
</script>

<style scoped>
.prose {
  max-width: none; /* Override default prose max-width */
}

/* Remove todos os paddings do Dialog */
.no-padding .p-dialog-content,
.no-padding .p-dialog-header,
.no-padding .p-dialog-footer {
  padding: 0 !important;
}

/* Zera margin/padding entre inputs */
.gmail-compose-content {
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

/* Ajustes tight para inputs */
.gmail-input {
  border: none;
  border-bottom: 1px solid #ddd;
  border-radius: 0;
  padding: 0.5rem;
  margin: 0;
  width: 100%;
  font-size: 0.95rem;
}

.gmail-input:focus {
  box-shadow: none;
  border-color: #42a5f5;
}

.gmail-textarea {
  border: none;
  resize: none;
  width: 100%;
  font-size: 0.95rem;
  min-height: 180px;
  padding: 0.5rem;
  margin: 0;
}

.gmail-textarea:focus {
  box-shadow: none;
  border-bottom: 1px solid #42a5f5;
}

.p-dialog-header-content {
  font-weight: 500;
  font-size: 1rem;
  padding-left: 0.5rem;
}

.p-dialog-header-icons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 0.5rem;
}

.gmail-header {
  display: flex;
  width: 100%;
  justify-content: space-between; /* Alinha os itens nas extremidades */
  align-items: center; /* Alinha verticalmente */
  padding: 0.4rem 0.5rem; /* Espaçamento interno */
}

.header-title {
  font-size: 1.25rem;
  font-weight: 500;
}

.header-icons {
  display: flex;
  align-items: center; /* Alinha os ícones verticalmente */
}

.send-icon-button {
  margin-right: 0.5rem; /* Espaço entre os botões */
}

.close-button {
  /* Adicione estilos específicos para o botão de fechar, se necessário */
}

/* Estilo padrão para telas maiores (> 1200px) */
@media screen and (min-width: 1201px) {
  .gmail-compose-dialog {
    width: 60vw !important; /* Largura menor para telas grandes */
  }
}

/* Para telas ainda maiores (> 1600px) */
@media screen and (min-width: 1601px) {
  .gmail-compose-dialog {
    width: 50vw !important; /* Largura ainda menor para telas muito grandes */
  }
}

/* Breakpoints para telas menores (como você já tinha) */
@media screen and (max-width: 1200px) and (min-width: 961px) {
  .gmail-compose-dialog {
    width: 80vw !important;
  }
}

@media screen and (max-width: 960px) and (min-width: 641px) {
  .gmail-compose-dialog {
    width: 90vw !important;
  }
}

@media screen and (max-width: 640px) {
  .gmail-compose-dialog {
    width: 95vw !important;
  }
}

</style>
