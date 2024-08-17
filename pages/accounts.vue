<script setup lang="ts">
import type { Database } from "@/types/database.types";
import type { Account } from "~/types/types";

const client = useSupabaseClient<Database>();

const accounts = ref<Account[]>([]);

const formatPrice = (price: number) => {
  if (!price) return 0;
  return price.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

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
</script>

<template>
  <div class="flex items-center gap-8">
    <div class="flex flex-col gap-4">
      <div
        v-for="acc in accounts"
        :key="acc.id"
        class="flex flex-col rounded-md px-2 py-3 shadow-md"
      >
        <span>Account: {{ acc.nombre }}</span>
        <span>Saldo: {{ formatPrice(acc.saldo) }}</span>
      </div>
      <accountCreation />
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4">
        <div v-for="flow in flows" :key="flow.id" class="flex flex-col gap-2">
          <div class="flex gap-4">
            <span>Account: {{ flow.account_id }}</span>
            <span class="text-emerald-400">
              A Favor: {{ formatPrice(flow.debit) }}
            </span>
            <span class="text-red-400">
              En Contra: {{ formatPrice(flow.credit) }}
            </span>
          </div>
        </div>
      </div>
      <accountAddFlow :accounts="accounts" />
    </div>
    <div class="flex flex-col gap-4">
      <usersNew />
    </div>
    <div class="flex flex-col gap-4">
      <salesNew />
    </div>
    <div class="flex flex-col gap-4">
      <purchaseNew />
    </div>
  </div>
</template>
