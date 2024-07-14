<script setup lang="ts">
useHead({
  title: "Nuxt 3 x Supabase",
});
</script>
<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toaster />
  </NuxtLayout>
</template>
