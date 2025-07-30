<template>
  <div class=" w-full p-5">
    <div class="card">
      <Toolbar class="mb-3" style="background-color: #111829;">
          <template #start>
            <h1 class="text-2xl mr-5 pb-1 pl-1">Categorias</h1>
          </template>

          <template #end>
            <Button
                  label="Novo grupo"
                  icon="pi pi-plus"
                  severity="secondary"
                  class="mr-2"
                  @click="openNew('grupo')"
                />
                <Button
                  label="Novo item"
                  icon="pi pi-plus"
                  severity="secondary"
                  class="mr-2"
                  @click="openNew('item')"
                />
            <IconField class="mr-2">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global']"
                placeholder="Procurar..."
              />
            </IconField>
            <Button
              label="Exportar"
              icon="pi pi-upload"
              severity="secondary"
              @click="exportCSV($event)"
            />
          </template>
      </Toolbar>
      <TreeTable
        :filters="filters"
        filterMode="lenient"
        v-model:selectionKeys="selectedKey" 
        :value="categoryTree"
        tableStyle="min-width: 50rem"
        selectionMode="single"
        dataKey="key"
        scrollable
        scrollHeight="360px"
        >
        <Column
          selectionMode="multiple"
          style="width: 3rem; background-color: #111829;"
          :exportable="false"
        ></Column>

        <Column sortable field="name" header="Nome" expander style="width: 25%; "></Column>
        <Column sortable field="type" header="Entrada/Saída" style="width: 20%; background-color: #111829;"></Column>
        <Column sortable field="node_type" header="Tipo" style="width: 15%; background-color: #111829;"></Column>
        <Column
          sortable
          field="description"
          header="Discrição"
          style="width: 50%; background-color: #111829;"
        ></Column>

        <Column :exportable="false" style="min-width: 12rem; background-color: #111829;">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editItem(slotProps.node)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteItem(slotProps.node)"
            />
          </template>
        </Column>
      </TreeTable>
    </div>

    <Dialog
      v-model:visible="itemDialog"
      :style="{ width: '450px' }"
      :header="`Novo - ${item.node_type}`"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <template v-for="col in columns" :key="col.field">
          <div v-if="col.editTemplate && !col.hide_editForm" class="mb-0">
            <label :for="col.field" class="block font-bold mb-2">
              {{ col.header }}
            </label>
            <!-- Campo de dinheiro -->

            <money3
              v-if="col.editTemplate === 'money'"
              v-model="item[col.field]"
              v-bind="config"
              class="p-inputtext p-component"
            />

            <!-- Campo de seleção -->
            <Select
              v-else-if="col.editTemplate === 'Select'"
              v-model="item[col.field]"
              :options="col.options"
              optionLabel="value"
              optionValue="key"
              placeholder="Selecione"
              :highlightOnSelect="false"
              class="w-full md:w-56"
            />

            <!-- Campo de data -->
            <Calendar
              v-else-if="col.editTemplate === 'calendar'"
              v-model="item[col.field]"
              dateFormat="dd/mm/yy"
              :locale="brLocale"
              showIcon
              class="w-full"
            />

            <!-- Componente genérico personalizado -->
            <component
              v-else
              :is="col.editTemplate"
              v-model="item[col.field]"
              :item="item"
              :options="col.options"
              :submitted="submitted"
              :field="col.field"
            />

            <!-- Validação -->
            <small
              v-if="submitted && (col.notNull && !item[col.field])"
              class="text-red-500"
            >
              {{ col.header }} é obrigatório.
            </small>
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
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import { executeQuery, executeQueryRun } from "~/utils/db"; // Adjust the import path as necessary

const toast = useToast();
const dt = ref();
const items = ref([]);
const itemDialog = ref(false);
const deleteItemDialog = ref(false);
const deleteItemsDialog = ref(false);
const item = ref({});
const lista = ref({});
const categoryTree = ref([]);
const selectedItems = ref([]);
const select_options = ref([]);
const original_select_options = ref([]);
const filters = ref({});
const submitted = ref(false);

const route = useRoute();
const original_items = ref()
const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden);
});
// 2. Define the Pass-Through object for the TreeTable
const treeTablePT = {
    // Target each row in the table's body
    bodyRow: ({ context }) => ({
        // 3. Apply a background class when the row is selected
        class: [
            { 'bg-blue-100 dark:bg-blue-900/50': context.selected },
            'cursor-pointer', // Optional: adds a pointer cursor to all rows
        ],
    }),
};
const selectedKey = ref();
const metaKey = ref(true)

const treePT = {
    // Target each tree node
    treenode: {
        // Target the content section of the node (the part you click on)
        content: ({ props, context }) => ({
            class: [
                // Add your custom classes here based on the 'selected' state
                {
                    'bg-blue-500 text-white': context.selected, // Applied when selected
                    'bg-transparent text-gray-700': !context.selected, // Applied when not selected
                },
                // Keep default PrimeVue classes for padding, etc.
                'p-2 rounded-md transition-colors duration-200',
            ],
        }),
    },
};

// Evento ao selecionar
function onNodeSelect(newSelection) {
  console.log('Selecionado:', newSelection)
  alert(newSelection)
}

function findNodeByKey(tree, key) {
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

const columns = ref([
  {
    field: "type",
    header: "Entrada/Saída",
    sortable: true,
    style: { "min-width": "10rem" },
    editTemplate: "Select",
    options: [
      { key: "entrada", value: "entrada" },
      { key: "saída", value: "saída" }
    ],
    optionLabel: "value",
    optionValue: "key",
    notNull: true
  },
  {
    field: "parent_id",
    header: "Pasta",
    sortable: true,
    style: { "min-width": "16rem" },
    editTemplate: "Select",
    options: select_options,
    optionLabel: "value",
    optionValue: "key"
  },
  {
    field: "node_type",
    header: "Tipo",
    sortable: true,
    style: { "min-width": "10rem" },
    editTemplate: "Select",
    options: [{ key: "item", value: "Item" }, { key: "grupo", value: "Grupo" }],
    optionLabel: "value",
    optionValue: "key",
    notNull: true
  },
  {
    field: "name",
    header: "Nome",
    sortable: true,
    style: { "min-width": "16rem" },
    editTemplate: InputText,
    notNull: true
  },
  {
    field: "description",
    header: "Descrição",
    sortable: true,
    style: { "min-width": "20rem" },
    editTemplate: InputText
  }
]);

const loadData = async () => {
  const data = await fetchData();
  items.value = data;
  // select_options.value = [{key: null, value: '---'}, ...buildTreeOptions(data)]

  const data2 = await fetchData2();
  select_options.value = [
    ...buildTreeOptions(data2)
  ];
  original_items.value = data;
  original_select_options.value = [...select_options.value];
  console.log("select_options.value:", select_options.value);
};

onMounted(async () => {
  loadData();
});

function formatValue(value) {
  if (typeof value == "object") {
    return value.join(", "); // Format as JSON string
  }
  return value;
}


function buildTreeOptions(data, type = "") {
  const map = new Map();
  const tree = [];

  // 1. Indexar por id (apenas os tipos válidos)
  data.forEach(item => {
    if (type != "") {
      if (item.type == type && item.node_type == "grupo") {
        map.set(item.id, { ...item, children: [] });
      }
    } else {
      if (item.node_type == "grupo") {
        map.set(item.id, { ...item, children: [] });
      }
    }
  });

  // 2. Montar estrutura em árvore
  map.forEach(item => {
    if (item.parent_id && map.has(item.parent_id)) {
      const parent = map.get(item.parent_id);
      parent.children.push(item);
    } else {
      tree.push(item);
    }
  });

  // 3. Gerar lista com caminho formatado
  const result = [];

  function walk(node, path) {
    const fullPath = path ? `${path} › ${node.name}` : node.name;
    result.push({ key: node.id, value: fullPath });
    node.children.forEach(child => walk(child, fullPath));
  }

  tree.forEach(root => walk(root, ""));
  return result;
}

watch(
  () => item.value.type,
  newVal => {
    if (newVal) {
      // alert(newVal)
      select_options.value = [
        { key: null, value: "---" },
        ...buildTreeOptions(items.value, newVal)
      ];
      // alert(JSON.stringify(select_options.value, null, 2))
    }
  }
);
// const filteredOptions = computed(() => {
//   // if (!item.value.type) return []
//   alert(item.value.type)
//   // return buildTreeOptions(categorias.value, selectedType.value)
// })

function buildCategoryTree(flatCategories) {
  // 1. Criar um mapa de ID para nó e uma lista de nós raiz
  const map = {};
  const tree = [];

  // 2. Primeiro passada: criar todos os nós no mapa
  flatCategories.forEach(item => {
    map[item.id] = {
      key: item.id,
      parent_id: item.parent_id,
      data: {
        name: item.name,
        type: item.type,
        node_type: item.node_type,
        description: item.description
      },
      children: []
    };
  });

  // 3. Segunda passada: conectar filhos aos pais
  flatCategories.forEach(item => {
    const node = map[item.id];

    if (item.parent_id) {
      // Se tem pai, adiciona como filho do pai
      if (map[item.parent_id]) {
        map[item.parent_id].children.push(node);
      }
    } else {
      // Sem pai, é um nó raiz
      tree.push(node);
    }
  });

  return tree;
}

async function fetchData() {
  // const route = useRoute(
  const data = await executeQuery(
    ` SELECT 
  t1.id,
  t1.parent_id as parent_id,
  t2.name AS parent_name,
  t1.name,
  t1.type,
  t1.node_type,
  t1.description
FROM financial_categories t1
LEFT JOIN financial_categories t2 ON t1.parent_id = t2.id
ORDER BY t1.name;
  `
  );

  console.log("Fetched data:", data);

  // Exemplo de uso:

  categoryTree.value = buildCategoryTree(data);
  console.log(JSON.stringify(categoryTree.value, null, 2));
  return data;
}

async function fetchData2() {
  // const route = useRoute(
  const data = await executeQuery(
    ` SELECT 
  t1.id,
  t1.parent_id as parent_id,
  t2.name AS parent_name,
  t1.name,
  t1.type,
  t1.node_type,
  t1.description
FROM financial_categories t1
LEFT JOIN financial_categories t2 ON t1.parent_id = t2.id
WHERE t1.node_type = 'grupo';
  `
  );

  console.log("Fetched data2:", data);

  // Exemplo de uso:

  return data;
}
const isEmpty = (obj) => Object.keys(obj).length === 0;

function openNew(x) {
  if (!selectedKey.value || isEmpty(selectedKey.value)) {
    alert("Selecione um grupo primeiro");
    return;}

  item.value = {};
  item.value.node_type = x;
  item.value.parent_id = +Object.keys(selectedKey.value)[0]

  if (!item.value.key){
      const a = findNodeByKey(categoryTree.value, +Object.keys(selectedKey.value)[0])
       item.value.type = a?.data.type
       if (a?.data.node_type != "grupo") {
          alert("Selecione um grupo primeiro");
          return;
       }
  }
  
  // alert(a.data.type)
 
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
    if (col.editTemplate && (col.notNull && !item.value[col.field])) {
      isValid = false;
      break;
    }
  }

  if (isValid) {
    try {
      const userData = { ...item.value };

      // 1. Salvar/atualizar os dados básicos do usuário na tabela 'users'
      const userResponse = await $fetch(`/api/upsert`, {
        method: "POST",
        body: {
          table: "financial_categories", // Substitua pelo nome da sua tabela
          data: userData,
          condition: item.value.id ? `id = ${item.value.id}` : null
        }
      });

      let userId;
      if (item.value.id) {
        userId = item.value.id;
        if (!userResponse?.message && userResponse !== null) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update user data",
            life: 3000
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
            life: 3000
          });
          return;
        }
      }

      toast.add({
        severity: "success",
        summary: "Successful",
        detail: "Item Saved",
        life: 3000
      });

      itemDialog.value = false;
      item.value = {};

      // 3. Atualizar a lista localmente
      if (item.value.id) {
        // Atualizar registro existente
        const index = items.value.findIndex(val => val.id === item.value.id);
        if (index !== -1) {
          items.value[index] = { ...userData }; // Use userData para atualizar
        }
      } else {
        // Adicionar novo registro
        items.value.push({ ...userData }); // Use userData para inserir
      }

      const data = await fetchData();
      items.value = data; // Recarregar os dados para exibir as alterações
      const data2 = await fetchData2();
      select_options.value = [
        { key: null, value: "---" },
        ...buildTreeOptions(data2)
      ];
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
  item.value = {
    id: selectedItem.key,
    parent_id: selectedItem.parent_id,
    name: selectedItem.data.name,
    type: selectedItem.data.type,
    node_type: selectedItem.data.node_type,
    description: selectedItem.data.description
  };
  lista.value = [
    { key: null, value: "------" },
    ...items.value.map(x => ({ key: x.id, value: x.name }))
  ];

  itemDialog.value = true;
}

function confirmDeleteItem(selectedItem) {
  console.log("Selected item for deletion:", selectedItem);
  item.value = { id: selectedItem.key, ...selectedItem };
  deleteItemDialog.value = true;
}

async function deleteItem() {
  try {
    const response = await $fetch(`/api/delete`, {
      method: "POST",
      body: {
        table: "financial_categories", // Substitua pelo nome da sua tabela
        condition: `id = ${item.value.id}`
      }
    });

    if (response && response.message) {
      // Excluiu com sucesso no banco de dados
      // Se necessário, atualize a lista localmente ou busque os dados novamente
      // items.value = items.value.filter((val) => val.id !== item.value.id); //Remova esta linha se voce for buscar os dados novamente.

      // Atualize a lista localmente
      items.value = items.value.filter(val => val.id !== item.value.id);
      loadData();
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

async function deleteSelectedItems() {
  items.value = items.value.filter(val => !selectedItems.value.includes(val));
  deleteItemsDialog.value = false;
  

  const response = await $fetch(`/api/delete`, {
    method: "POST",
    body: {
      table: "financial_categories", // Substitua pelo nome da sua tabela
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

function formatCurrency(value) {
  if (value)
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  return;
}
</script>
<style scoped>
 ::v-deep(.p-treetable .p-treetable-tbody > tr.p-highlight) {
  background-color: #4a90e2 !important;
  color: white !important;
}
</style>