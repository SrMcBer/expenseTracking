<script setup lang="ts">
import type { Database, Tables } from "@/types/database.types";
import { toast } from "vue-sonner";
import * as z from "zod";

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const formSchema = z.object({
  name: z.string().min(10).max(50),
  purchase_price: z.number().min(0),
  sale_price: z.number().min(0),
  category: z.string().min(3).max(50),
  description: z.string().min(10).max(255),
});

const loading = ref(false);
const isDialogOpen = ref(false);

async function onSubmit(values: Record<string, any>) {
  console.log(values);
  if (!user.value) return;
  loading.value = true;

  const { data, error } = await client.from("Product").upsert(values).select();

  if (!data) return;
  if (error) {
    console.error(error);
    toast.error("Error al crear el producto");
    return;
  }
  loading.value = false;
  isDialogOpen.value = false;
}
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button variant="success">
        <Icon name="ph:plus" class="mr-2"></Icon> Crear Producto
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Crear Producto</DialogTitle>
        <DialogDescription>
          Creación de un nuevo producto en la base de datos.
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col items-center space-x-2">
        <AutoForm
          :schema="formSchema"
          @submit="onSubmit"
          class="w-full space-y-6"
        >
          <div class="flex items-center gap-4">
            <Button variant="success" :disabled="loading" type="submit">
              <Icon
                v-if="loading"
                name="ph:arrow-clockwise"
                class="mr-2 size-4 animate-spin"
              ></Icon>
              Crear Producto
            </Button>
            <Button
              type="button"
              variant="destructive"
              @click="isDialogOpen = false"
            >
              Cancelar
            </Button>
          </div>
        </AutoForm>
      </div>
    </DialogContent>
  </Dialog>
</template>
