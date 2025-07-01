<template>
  <div>
    <div class="card">
      <Toolbar class="mb-1">
        <template #start>
          <Button
            label="New"
            icon="pi pi-plus"
            severity="secondary"
            class="mr-2"
            @click="openNew"
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            severity="secondary"
            @click="confirmDeleteSelected"
            :disabled="!selectedItems || !selectedItems.length"
          />
        </template>

        <template #end>
          <Button
            label="Export"
            icon="pi pi-upload"
            severity="secondary"
            @click="exportCSV($event)"
          />
        </template>
      </Toolbar>
      <DataTable
        ref="dt"
        v-model:selection="selectedItems"
        :value="items"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="{first} até {last} de {totalRecords} itenxs"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Usuários</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Procurar..."
              />
            </IconField>
          </div>
        </template>

        <Column
          selectionMode="multiple"
          style="width: 3rem"
          :exportable="false"
        ></Column>

        <Column
          v-for="col in visibleColumns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          :sortable="col.sortable"
          :style="col.style"
        >
          <template #body="slotProps">
            <!-- {{ formatValue(slotProps.data[col.field]) }} -->
            {{ slotProps.data[col.field] }}
          </template>

          <!-- <template v-if="col.bodyTemplate" #body="slotProps">
            <component
              :is="col.bodyTemplate"
              :slotProps="slotProps"
              :formatCurrency="formatCurrency"
              :getStatusLabel="getStatusLabel"
            />
          </template> -->
        </Column>

        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editItem(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteItem(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="itemDialog"
      :style="{ width: '450px' }"
      header="Registro"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <template v-for="col in columns" :key="col.field">
          <div v-if="col.editTemplate">
            <label :for="col.field" class="block font-bold mb-3">{{
              col.header
            }}</label>
            <component
              :is="col.editTemplate"
              v-model="item[col.field]"
              :item="item"
              :options="col.options"
              :submitted="submitted"
              :field="col.field"
              :optionLabel="col.optionLabel"
              :optionValue="col.optionValue"
              class="w-full border rounded"
            />
            <small v-if="submitted" class="text-red-500"
              >{{ col.header }} is required.</small
            >
          </div>
        </template>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveItem" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteItemDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="item"
          >Excluir item <b>{{ item.name }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteItemDialog = false"
        />
        <Button label="Yes" icon="pi pi-check" @click="deleteItem" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteItemsDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="item">Excluir itens selecionados?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteItemsDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          text
          @click="deleteSelectedItems"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['authenticated'],
})
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "@primevue/core/api";
import InputText from "primevue/inputtext";
import { executeQuery, executeQueryRun } from "~/utils/db"; // Adjust the import path as necessary
import Select from 'primevue/select';
const { user, clear: clearSession } = useUserSession()

const toast = useToast();
const dt = ref();
const items = ref([]);
const itemDialog = ref(false);
const deleteItemDialog = ref(false);
const deleteItemsDialog = ref(false);
const item = ref({});
const selectedItems = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const route = useRoute();


const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden);
});

const columns = ref([
  {
    field: "name",
    header: "Nome",
    sortable: true,
    style: { "min-width": "8rem" },
    editTemplate: InputText
  },
  {
    field: "type",
    header: "Tipo",
    sortable: true,
    style: { "min-width": "5rem" },
    editTemplate: Select,
    options: [{key:'Física', value:'Física'}, {key:'Jurídica', value:'Jurídica'}],
    optionLabel: "value",
    optionValue: "key"
  },
  {
    field: "doc",
    header: "Documento",
    sortable: true,
    style: { "min-width": "5rem" },
    editTemplate: InputText
  },
  {
    field: "email",
    header: "Email",
    sortable: true,
    style: { "min-width": "5rem" },
    editTemplate: InputText
  },
  {
    field: "fone1",
    header: "Telefone 1",
    sortable: true,
    style: { "min-width": "5rem" },
    editTemplate: InputText
  },
  {
    field: "fone2",
    header: "Telefone 2",
    sortable: true,
    style: { "min-width": "5rem" },
    editTemplate: InputText,
    hidden: true, // Hidden by default
  },
  {
    field: "address",
    header: "Endereço",
    sortable: true,
    style: { "min-width": "5rem" },
    hidden: true, // Hidden by default
    editTemplate: InputText
  },
  {
    field: "obs",
    header: "Observações",
    sortable: true,
    style: { "min-width": "5rem" },
    hidden: true, // Hidden by default
    editTemplate: InputText
  }
]);

onMounted(async () => {
  const data = await fetchData();
  items.value = data;
});


function formatValue(value) {
  if (typeof value == 'object') {
    return value.join(', '); // Format as JSON string
  }
  return value 
}


async function fetchData() {
  // const route = useRoute(
  const data = await executeQuery(`SELECT * from contacts`);

  console.log("Fetched data:", data);

  return data;
}

function openNew() {
  item.value = {};
  submitted.value = false;
  itemDialog.value = true;
}

function hideDialog() {
  itemDialog.value = false;
  submitted.value = false;
}

async function saveItem() {
  submitted.value = true;

  let isValid = true;
//   for (const col of columns.value) {
//     if (col.editTemplate && !item.value[col.field] && col.field !== 'roles') {
//       isValid = false;
//       break;
//     }
//   }

  if (isValid) {
    try {
      const userData = {...item.value, user_id: user.value.id}
       

      // 1. Salvar/atualizar os dados básicos do usuário na tabela 'users'
      const userResponse = await $fetch(`/api/upsert`, {
        method: "POST",
        body: {
          table: "contacts", // Substitua pelo nome da sua tabela
          data: userData,
          condition: item.value.id ? `id = ${item.value.id}` : null,
        },
      });

      let userId;
      if (item.value.id) {
        userId = item.value.id;
        if (!userResponse?.message && userResponse !== null) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update user data",
            life: 3000,
          });
          return;
        }
      } else {
        if (userResponse?.result?.lastInsertRowid) {
          userId = userResponse?.result?.lastInsertRowid;
          userData.id = userId; // Adicionar o ID ao userData para inserção
        } else {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to create new user",
            life: 3000,
          });
          return;
        }
      }

      toast.add({
        severity: "success",
        summary: "Successful",
        detail: "Item Saved",
        life: 3000,
      });

      itemDialog.value = false;
      item.value = {};

      // 3. Atualizar a lista localmente
      if (item.value.id) {
        // Atualizar registro existente
        const index = items.value.findIndex((val) => val.id === item.value.id);
        if (index !== -1) {
          items.value[index] = { ...userData}; // Use userData para atualizar
        }
      } else {
        // Adicionar novo registro
        items.value.push({ ...userData}); // Use userData para inserir
      }

      const data = await fetchData();
      items.value = data; // Recarregar os dados para exibir as alterações
    } catch (error) {
      console.error("Error saving item:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while saving the item.",
        life: 3000,
      });
    }
  }
}
function editItem(selectedItem) {
  item.value = { ...selectedItem };
  itemDialog.value = true;
}

function confirmDeleteItem(selectedItem) {
  item.value = selectedItem;
  deleteItemDialog.value = true;
}

async function deleteItem() {
  try {
    const response = await $fetch(`/api/delete`, {
      method: "POST",
      body: {
        table: "contacts", // Substitua pelo nome da sua tabela
        condition: `id = ${item.value.id}`
      }
    });

    if (response && response.message) {
      // Excluiu com sucesso no banco de dados
      // Se necessário, atualize a lista localmente ou busque os dados novamente
      // items.value = items.value.filter((val) => val.id !== item.value.id); //Remova esta linha se voce for buscar os dados novamente.
      
      // Atualize a lista localmente
      items.value = items.value.filter(val => val.id !== item.value.id);

      toast.add({
        severity: "success",
        summary: "Successful",
        detail: response.message,
        life: 3000
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete item",
        life: 3000
      });
    }

    deleteItemDialog.value = false;
    item.value = {};
  } catch (error) {
    console.error("Error deleting item:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "An error occurred while deleting the item.",
      life: 3000
    });
  }
}

function findIndexById(id) {
  return items.value.findIndex(val => val.id === id);
}

function createId() {
  // Replace with your actual ID generation logic (e.g., UUID)
  let id = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function exportCSV() {
  dt.value.exportCSV();
}

function confirmDeleteSelected() {
  deleteItemsDialog.value = true;
}

function deleteSelectedItems() {
  items.value = items.value.filter(val => !selectedItems.value.includes(val));
  deleteItemsDialog.value = false;
  selectedItems.value = null;
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Items Deleted",
    life: 3000
  });
}

function formatCurrency(value) {
  if (value)
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  return;
}

</script>
