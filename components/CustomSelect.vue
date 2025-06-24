// components/CustomSelect.vue
<template>
  <select
    v-model="selectedValue"
    @change="emitValue"
    :id="field"
    class="p-2 border rounded w-full bg-amber-700"
  >
    <option v-for="option in options" :key="option.key" :value="option.key">
      {{ option.value }}
    </option>
  </select>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: String,
  options: Array,
  field: String,
  submitted: Boolean
});

const emit = defineEmits(['update:modelValue']);

const selectedValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== selectedValue.value) {
      selectedValue.value = newValue;
    }
  }
);

onMounted(() => {
  selectedValue.value = props.modelValue;
});

const emitValue = () => {
  emit('update:modelValue', selectedValue.value);
};
</script>