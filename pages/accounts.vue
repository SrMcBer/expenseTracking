<script setup lang="ts">
import type { Database } from "@/types/database.types";
import type { Account } from "~/types/types";

const client = useSupabaseClient<Database>();

const accounts = ref<Account[]>([]);

await useAsyncData("accounts", async () => {
  const { data } = await client.from("Account").select().order("id");
  if (data) {
    accounts.value = data;
  }
});

const { data: flows } = await useAsyncData("cashFlow", async () => {
  const { data } = await client.from("AssetFlow").select().order("id");
  return data;
});

const { data: users } = await useAsyncData("users", async () => {
  const { data } = await client.from("Users").select().order("id");
  return data;
});
</script>

<template>
  <div class="flex items-center gap-8">
    <div class="flex flex-col gap-4">
      {{ accounts }}
      <accountCreation />
    </div>
    <div class="flex flex-col gap-4">
      {{ flows }}
      <accountAddFlow :accounts="accounts" />
    </div>
    <div class="flex flex-col gap-4">
      {{ users }}
      <usersNew />
    </div>
    <div class="flex flex-col gap-4">
      F
      <salesNew />
    </div>
    <div class="flex flex-col gap-4">
      <purchaseNew />
    </div>
  </div>
</template>
