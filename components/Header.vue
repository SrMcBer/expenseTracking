<script setup lang="ts">
const client = useSupabaseClient();
const user = useSupabaseUser();
const colorMode = useColorMode();

const logOut = async () => {
  await client.auth.signOut();
  navigateTo("/");
};
const isDark = ref(colorMode.preference === "light");

const handleUpdate = (value: boolean) => {
  isDark.value = value;
  colorMode.preference = value ? "light" : "dark";
};
</script>

<template>
  <div
    class="fixed top-0 z-20 flex h-10 w-full items-center justify-center bg-slate-600 md:justify-between"
  >
    <div class="flex w-full items-center justify-between px-10">
      <div class="flex w-32 items-center justify-evenly">
        <Icon name="ph:moon-fill" class="size-6" />
        <Switch
          v-model:checked="isDark"
          @update:checked="handleUpdate"
        ></Switch>
        <Icon name="ph:sun-fill" class="size-6" />
      </div>
      <Button
        v-if="user"
        class="text-white dark:text-slate-800"
        @click="logOut"
      >
        Logout
      </Button>
    </div>
  </div>
</template>
