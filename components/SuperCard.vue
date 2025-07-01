<template>
  <Card class="my-0" _style="width: 25rem; overflow: hidden">
    <template #title>
      <div class="text-center bg-amber-300 text-amber-950 rounded-2xl text-[18px] py-1 mb-2">{{ title }}</div>
    </template>
    <template #content>
      <slot />
    </template>
    <!-- <template #footer>
        <div class="flex gap-4 mt-1">
            <Button label="Cancel" severity="secondary" outlined class="w-full" />
            <Button label="Save" class="w-full" />
        </div>
    </template> -->
  </Card>
</template>

<script setup>
defineProps({
    title: {
      type: String,
      required: true
    },
  data: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.table-container {
  background-color: rgb(44, 43, 43);

  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
}

.label-value-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table-row {
  border-bottom: 1px solid #e5e7eb; /* light gray */
}

.table-row:last-child {
  border-bottom: none;
}

.label-cell {
  font-weight: 600;
  padding: 8px 16px 8px 0;
  size: 15px;
  width: 60%;
  color: #f5f5f5; /* gray-700 */
  text-align: right; /* ✅ align label to the right */
}

.value-cell {
  padding: 8px 0;
  color: #b1b1b1; /* gray-900 */
}
</style>
