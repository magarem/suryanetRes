<template>
  <div>
    <!-- This will render the default layout, which then renders the page inside its <slot /> -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// This is a great place for app-wide metadata that never changes.
useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    }
  ],
  htmlAttrs: {
    class: 'app-dark'
  }
})
</script>