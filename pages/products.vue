<script setup lang="ts">
import type { Database } from "@/types/database.types";

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const { data: products } = await useAsyncData("products", async () => {
  if (!user.value) return;
  const { data } = await client.from("Product").select().order("id");
  return data;
});
</script>

<template>
  <section>
    <productsTable :products="products" />
  </section>
</template>
