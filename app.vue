<script setup lang="ts">
useHead({
  title: "Zaphi Admin",
});
</script>
<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toaster rich-colors position="top-right" />
  </NuxtLayout>
</template>
