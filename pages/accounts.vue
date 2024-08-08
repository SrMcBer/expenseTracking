<script setup lang="ts">
import type { Database } from "@/types/database.types";
import type { Account } from "~/types/types";

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

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

const { data: sales } = await useAsyncData("sales", async () => {
  const { data } = await client
    .from("Sales")
    .select(`*, Sales_Det()`)
    .order("id");
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
      {{ sales }}
      <salesNewSale />
    </div>
  </div>
</template>
