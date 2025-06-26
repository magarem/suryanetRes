<template>
  <div class="card bg-gray-800 p-4 rounded-lg">
    <Toolbar class="mb-4 bg-gray-700 border-gray-600 rounded-md">
      <template #start>
        <Button 
          :label="config.buttons.new" 
          icon="pi pi-plus" 
          class="p-button-success mr-2" 
          @click="openNew" 
        />
        <Button 
          :label="config.buttons.deleteSelected" 
          icon="pi pi-trash" 
          class="p-button-danger" 
          @click="confirmDeleteSelected" 
          :disabled="!selectedItems || !selectedItems.length" 
        />
      </template>
      <template #end>
        <IconField iconPosition="left">
            <InputIcon>
                <i class="pi pi-search" />
            </InputIcon>
            <InputText 
              v-model="filters['global'].value" 
              :placeholder="config.labels.search" 
              class="bg-gray-600 border-gray-500" 
            />
        </IconField>
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      :value="items"
      v-model:selection="selectedItems"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :filters="filters"
      :pt="config.tableStyles"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      :currentPageReportTemplate="config.labels.paginatorReport"
      responsiveLayout="scroll"
    >
      <Column selectionMode="multiple" style="width: 3rem"></Column>
      
      <!-- Dynamic Columns -->
      <Column 
        v-for="col of schema.filter(c => !c.hidden)" 
        :key="col.field" 
        :field="col.field" 
        :header="col.header" 
        :sortable="true"
      >
        <template #body="slotProps">
           <!-- Handle nested objects for display -->
          <span v-if="col.field.includes('.')">
            {{ getNestedValue(slotProps.data, col.field) }}
          </span>
          <span v-else>
            {{ slotProps.data[col.field] }}
          </span>
        </template>
      </Column>

      <Column headerStyle="min-width:10rem;">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editItem(slotProps.data)" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteItem(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <!-- Edit/Create Dialog -->
    <Dialog v-model:visible="itemDialog" :style="{width: '450px'}" :header="dialogHeader" :modal="true" class="p-fluid" :pt="config.dialogStyles">
      <div v-if="currentItem" class="flex flex-col gap-6 mt-4">
        <div v-for="col of schema.filter(c => c.form)" :key="col.field">
          <label :for="col.field" class="font-bold mb-2 block">{{ col.header }}</label>
          <component 
            :is="col.component"
            v-model="currentItem[col.field]"
            :id="col.field"
            :class="{'p-invalid': submitted && !currentItem[col.field]}"
            v-bind="col.props || {}"
          />
          <small class="p-error" v-if="submitted && !currentItem[col.field]">{{ col.header }} is required.</small>
        </div>
      </div>
      <template #footer>
        <Button :label="config.buttons.cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
        <Button :label="config.buttons.save" icon="pi pi-check" class="p-button-text" @click="saveItem" />
      </template>
    </Dialog>
    
    <!-- Delete Confirmation Dialogs -->
    <Dialog v-model:visible="deleteItemDialog" :style="{width: '450px'}" :header="config.dialogs.delete.header" :modal="true" :pt="config.dialogStyles">
      <div class="confirmation-content flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl text-yellow-500" />
        <span v-if="currentItem">Are you sure you want to delete <b>{{ currentItem[displayField] || currentItem.id }}</b>?</span>
      </div>
      <template #footer>
        <Button :label="config.buttons.no" icon="pi pi-times" class="p-button-text" @click="deleteItemDialog = false"/>
        <Button :label="config.buttons.yes" icon="pi pi-check" class="p-button-text" @click="deleteConfirmedItem" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteItemsDialog" :style="{width: '450px'}" :header="config.dialogs.deleteSelected.header" :modal="true" :pt="config.dialogStyles">
        <div class="confirmation-content flex items-center gap-4">
          <i class="pi pi-exclamation-triangle !text-3xl text-yellow-500" />
          <span>Are you sure you want to delete the selected items?</span>
        </div>
        <template #footer>
          <Button :label="config.buttons.no" icon="pi pi-times" class="p-button-text" @click="deleteItemsDialog = false"/>
          <Button :label="config.buttons.yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedItems" />
        </template>
    </Dialog>
    
    <Toast />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';


// --- PROPS ---
const props = defineProps({
  schema: {
    type: Array,
    required: true,
  },
  fetchData: {
    type: Function,
    required: true,
  },
  createData: {
    type: Function,
    required: true,
  },
  updateData: {
    type: Function,
    required: true,
  },
  deleteData: {
    type: Function,
    required: true,
  },
  config: {
    type: Object,
    default: () => ({
      labels: {
        search: 'Search...',
        paginatorReport: 'Showing {first} to {last} of {totalRecords} items'
      },
      buttons: {
        new: 'New',
        deleteSelected: 'Delete',
        cancel: 'Cancel',
        save: 'Save',
        yes: 'Yes',
        no: 'No'
      },
      dialogs: {
        newItem: 'New Item',
        editItem: 'Edit Item',
        delete: { header: 'Confirm' },
        deleteSelected: { header: 'Confirm' }
      },
      tableStyles: {
        root: { class: 'border-separate border-spacing-0 rounded-lg overflow-hidden' },
        header: { class: 'bg-gray-700 text-gray-100 p-4 border-b border-gray-600' },
        thead: { class: 'bg-gray-700' },
        tbody: { class: 'bg-gray-800' },
        row: ({ props }) => ({
            class: [
                props.frozenRow ? 'bg-gray-900' : 'text-gray-200 hover:bg-gray-700/50',
                { 'bg-blue-900/50 text-blue-200': props.selected }
            ]
        }),
        column: {
            headercell: { class: 'text-left p-4 font-semibold border-b border-gray-600' },
            bodycell: { class: 'p-4 border-b border-gray-600' }
        },
        paginator: {
            root: { class: 'bg-gray-700 text-gray-200 flex items-center justify-center flex-wrap p-4 border-t border-gray-600 rounded-b-lg' },
            pagebutton: ({ props }) => ({
                class: [
                    'rounded-full w-10 h-10 mx-1 transition-colors duration-200',
                    { 'bg-blue-500 text-white': props.active }
                ]
            })
        }
      },
      dialogStyles: {
        root: { class: 'border-none rounded-lg shadow-2xl bg-gray-900' },
        header: { class: 'bg-gray-800 text-gray-100 p-4 rounded-t-lg flex items-center justify-between' },
        content: { class: 'bg-gray-900 text-gray-200 p-6' },
        footer: { class: 'bg-gray-800 text-gray-100 p-4 rounded-b-lg text-right' },
        closebutton: { class: 'w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500' },
        closebuttonicon: { class: 'w-4 h-4' }
      }
    })
  }
});

// --- STATE ---
const toast = useToast();
const dt = ref();
const items = ref([]);
const selectedItems = ref([]);
const currentItem = ref({});
const itemDialog = ref(false);
const deleteItemDialog = ref(false);
const deleteItemsDialog = ref(false);
const submitted = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// --- COMPUTED ---
const dialogHeader = computed(() => {
  return currentItem.value.id ? props.config.dialogs.editItem : props.config.dialogs.newItem;
});

const displayField = computed(() => {
  const field = props.schema.find(col => col.displayField);
  return field ? field.field : 'id';
});

// --- METHODS ---
onMounted(async () => {
  items.value = await props.fetchData();
});

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const openNew = () => {
  const newItem = {};
  props.schema.forEach(col => {
    if (col.form) {
      newItem[col.field] = col.defaultValue !== undefined ? col.defaultValue : null;
    }
  });
  currentItem.value = newItem;
  submitted.value = false;
  itemDialog.value = true;
};

const hideDialog = () => {
  itemDialog.value = false;
  submitted.value = false;
};

const editItem = (item) => {
  currentItem.value = { ...item };
  // Ensure all form fields exist on the object to prevent reactivity issues
  props.schema.forEach(col => {
    if (col.form && !Object.prototype.hasOwnProperty.call(currentItem.value, col.field)) {
        currentItem.value[col.field] = col.defaultValue !== undefined ? col.defaultValue : null;
    }
  });
  itemDialog.value = true;
};

const saveItem = async () => {
  submitted.value = true;
  
  const isValid = props.schema
    .filter(col => col.required)
    .every(col => currentItem.value[col.field]);

  if (!isValid) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.', life: 3000 });
    return;
  }

  try {
    if (currentItem.value.id) {
      const updatedItem = await props.updateData(currentItem.value);
      const index = items.value.findIndex(item => item.id === updatedItem.id);
      if(index > -1) items.value[index] = updatedItem;
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Item Updated', life: 3000 });
    } else {
      const newItem = await props.createData(currentItem.value);
      items.value.push(newItem);
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Item Created', life: 3000 });
    }
    itemDialog.value = false;
    currentItem.value = {};
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while saving.', life: 3000 });
  }
};

const confirmDeleteItem = (item) => {
  currentItem.value = item;
  deleteItemDialog.value = true;
};

const deleteConfirmedItem = async () => {
  try {
    await props.deleteData(currentItem.value.id);
    items.value = items.value.filter(val => val.id !== currentItem.value.id);
    deleteItemDialog.value = false;
    currentItem.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Item Deleted', life: 3000 });
  } catch(error) {
     toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while deleting.', life: 3000 });
  }
};

const confirmDeleteSelected = () => {
  deleteItemsDialog.value = true;
};

const deleteSelectedItems = async () => {
  const idsToDelete = selectedItems.value.map(item => item.id);
  try {
    await Promise.all(idsToDelete.map(id => props.deleteData(id)));
    items.value = items.value.filter(val => !selectedItems.value.includes(val));
    deleteItemsDialog.value = false;
    selectedItems.value = [];
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Items Deleted', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while deleting items.', life: 3000 });
  }
};
</script>
