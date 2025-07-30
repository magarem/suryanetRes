<template>
  <div>
    <div class="card m-4">
      <CustomDataTable
        title="Perfis"
        :items="items"
        :filters="filters"
        :visibleColumns="visibleColumns"
        v-model:selectedItems="selectedItems"
        :formatCurrency="formatCurrency"
        :formatDateBR="formatDateBR"
        :editItem="editItem"
        :openNew="openNew"
        @deleteItem="deleteItem"
        @deleteSelectedItems="deleteSelectedItems"
      />
    </div>

    <Dialog
      v-model:visible="itemDialog"
      :style="{ width: '450px' }"
      header="Item Details"
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
            />
            <small v-if="submitted && !item[col.field]" class="text-red-500"
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
import Textarea from "primevue/textarea";
import {executeQuery} from "~/utils/db"; // Adjust the import path as necessary
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
const { user, clear: clearSession } = useUserSession()
const domain = user.value.domain;
const columns = ref([
  { field: "id", header: "ID", sortable: true, style: { "min-width": "8rem", "background-color": "#111829" } },
  {
    field: "name",
    header: "Nome",
    sortable: true,
    style: { "min-width": "16rem", "background-color": "#111829" },
    editTemplate: InputText
  },
  {
    field: "desc",
    header: "Descrição",
    sortable: true,
    style: { "min-width": "16rem", "background-color": "#111829"},
    editTemplate: Textarea
  }
]);
const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden);
});
onMounted(async () => {
  // Replace with your data fetching logic

  // const { data: users } = await useFetch(`/api/${domain}/lista`);
  const data = await fetchData();
  items.value = data;
});

async function fetchData() {
  const data = await executeQuery("SELECT * FROM roles");
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
  for (const col of columns.value) {
    if (col.editTemplate && !item.value[col.field]) {
      isValid = false;
      break;
    }
  }

  if (isValid) {
    try {
      const response = await $fetch(`/api/upsert`, {
        method: "POST",
        body: {
          table: "roles", // Substitua pelo nome da sua tabela
          data: item.value,
          condition: item.value.id ? `id = ${item.value.id}` : null // Condição para update (se existir id)
        }
      });

      if (response && response.message) {
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
          detail: "Failed to save item",
          life: 3000
        });
      }

      itemDialog.value = false;
      // item.value = {};
      const data = await fetchData();
      items.value = data;
      // Aqui você pode adicionar lógica para atualizar a lista de itens, se necessário.
      // Por exemplo, buscar novamente os dados da tabela.
    } catch (error) {
      console.error("Error saving item:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while saving the item.",
        life: 3000
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

async function deleteItem(item) {
  await executeQueryRun(
    `DELETE FROM roles WHERE id = ${item.id}`
  );
  const data = await fetchData();
  items.value = data;
  deleteItemDialog.value = false;
  item.value = {};
  toast.add({ severity: "success", summary: "Removido", life: 3000 });
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

async function deleteSelectedItems() {
  items.value = items.value.filter(val => !selectedItems.value.includes(val));
  deleteItemsDialog.value = false;
  

  const response = await $fetch(`/api/delete`, {
    method: "POST",
    body: {
      table: "roles", // Substitua pelo nome da sua tabela
      condition: `id in (${selectedItems.value.map(item => item.id).join(',')})`
    }
  });
  selectedItems.value = null;
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Items Deleted",
    life: 3000
  });
}

// Example body templates (replace with your specific needs)
const ImageBody = {
  template:
    '<img :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.image}`" :alt="slotProps.data.image" class="rounded" style="width: 64px" />'
};

const PriceBody = {
  template: "{{ formatCurrency(slotProps.data.price) }}"
};

const RatingBody = {
  template: '<Rating :modelValue="slotProps.data.rating" :readonly="true" />'
};

const StatusBody = {
  template:
    '<Tag :value="slotProps.data.inventoryStatus" :severity="getStatusLabel(slotProps.data.inventoryStatus)" />'
};

function formatCurrency(value) {
  if (value)
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  return;
}

function getStatusLabel(status) {
  switch (status) {
    case "INSTOCK":
      return "success";
    case "LOWSTOCK":
      return "warn";
    case "OUTOFSTOCK":
      return "danger";
    default:
      return null;
  }
}
</script>
