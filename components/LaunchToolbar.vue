<script setup>
defineProps({
  title: String,
  openNew: Function,
  confirmDeleteSelected: Function,
  exportCSV: Function,
  filters: Object,
  selectedItems: Array
})

// Emits
const emit = defineEmits([
    'confirmDeleteSelected',
  'deleteSelectedItems'
])

</script>

<template>
  <Toolbar class="mb-3" style="background-color: #111829;">
    <template #start>
      <h1 class="text-2xl mr-5 pb-1 pl-1">{{title}}</h1>
    </template>

    <template #end>
      <Button
        label="Novo"
        icon="pi pi-plus"
        severity="secondary"
        class="mr-2"
        @click="openNew"
      />
      <Button
        label="Excluir"
        icon="pi pi-trash"
        severity="secondary"
        class="mr-2"
        @click="confirmDeleteSelected"
        :disabled="!selectedItems || !selectedItems.length"
      />
      <IconField class="mr-2">
        <InputIcon>
          <i class="pi pi-search" />
        </InputIcon>
        <InputText
          v-model="filters['global'].value"
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
</template>
