<script setup lang="ts">
const user = useSupabaseUser();

watch(
  user,
  () => {
    if (user.value) {
      return navigateTo("/tasks");
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <p class="text-sm">Redirecting to tasks...</p>
  </div>
</template>
