// components/CustomCheckbox.vue
<template>
  <div class="flex flex-wrap gap-3">
    <div v-for="option in options" :key="option" class="flex items-center">
      <input
        type="checkbox"
        :id="option.key"
        :value="option.key"
        v-model="internalValue"
        @change="emitValue"
        class="mr-2"
      />
      <label :for="option" class="mr-3">{{ option.value }}</label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Array, // Array of strings
  options: Array, // Array of strings
  field: String,
  submitted: Boolean
});

console.log('CustomCheckbox props:', props);

const emit = defineEmits(['update:modelValue']);

const internalValue = ref(props.modelValue ? [...props.modelValue] : []); // Clone the array

watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue ? [...newValue] : [];
});

const emitValue = () => {
  emit('update:modelValue', internalValue.value);
};
</script>