<script setup>
definePageMeta({
  layout: false, // Disables all layouts
});
const pathStore = usePathStore()

console.log('domain:', pathStore.domain)
console.log('Usuário:', pathStore.username)
console.log('Página:', pathStore.page)
</script>
<template>
    <div class="flex flex-col items-center justify-center h-screen">
        <h1 class="text-2xl font-bold mb-4">Página TT</h1>
        <p class="text-lg">pathStore: {{ pathStore }}</p>
        <p class="text-lg">domain: {{ pathStore.domain }}</p>
        <p class="text-lg">Usuário: {{ pathStore.username }}</p>
        <p class="text-lg">Página: {{ pathStore.page }}</p>
    </div>  
</template>
