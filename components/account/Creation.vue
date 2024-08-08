<script setup lang="ts">
import type { Database } from "@/types/database.types";
import { toast } from "vue-sonner";
import * as z from "zod";

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const formSchema = z.object({
  nombre: z.string(),
  tipo: z.enum(["Efectivo", "Nequi", "Banco"]),
});

const loading = ref(false);
const isDialogOpen = ref(false);

async function onSubmit(values: Record<string, any>) {
  if (!user.value) return;
  loading.value = true;

  const { error } = await client.from("Account").upsert(values).select();
  if (error) {
    toast.error("Error al crear cuenta");
    loading.value = false;
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
        <Icon name="ph:folder-plus" class="mr-2"></Icon> Nueva Cuenta
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Crear Cuenta</DialogTitle>
        <DialogDescription>
          Creación de una nueva cuenta en la base de datos. Aca se pueden
          ingresar diferentes valores
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
