<script setup lang="ts">
import type { Database } from "@/types/database.types";
import { toast } from "vue-sonner";
const loading = ref(false);
const isDialogOpen = ref(false);
const username = ref("");
const cargo = ref("");

const client = useSupabaseClient<Database>();

const createUser = async () => {
  if (!username.value || !cargo.value) {
    toast.error("Por favor, rellene todos los campos");
    return;
  }
  if (username.value.length < 6) {
    toast.error("El nombre de usuario debe tener al menos 6 caracteres");
    return;
  }
  loading.value = true;
  const { data, error } = await client
    .from("Users")
    .upsert({
      username: username.value,
      Cargo: cargo.value,
    })
    .select();
  if (!data) {
    toast.error("Error al crear el usuario");
    return;
  }
  if (error) {
    console.error(error);
    toast.error("Error al crear el producto");
    return;
  }
  loading.value = false;
  isDialogOpen.value = false;
};
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button variant="success">
        <Icon name="ph:user" class="mr-2"></Icon> Nuevo Usuario
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Usuarios</DialogTitle>
        <DialogDescription> Creacion de vendedores, etc </DialogDescription>
      </DialogHeader>
      <div class="flex w-full flex-col items-center space-x-2">
        <div class="flex w-full flex-col gap-4">
          <div class="flex w-full flex-col gap-2">
            <Label for="Nombre">username</Label>
            <Input
              id="Nombre"
              type="text"
              placeholder="Nombre"
              v-model:model-value="username"
            />
          </div>
          <div class="flex w-full flex-col gap-2">
            <Label for="cargo">Cargo</Label>
            <Input
              id="cargo"
              type="text"
              placeholder="Cargo"
              v-model:model-value="cargo"
            />
          </div>
          <div class="flex items-center gap-4">
            <Button variant="success" :disabled="loading" @click="createUser">
              <Icon
                v-if="loading"
                name="ph:plus"
                class="mr-2 size-4 animate-spin"
              />
              Crear Usuario
            </Button>
            <Button
              type="button"
              variant="destructive"
              @click="isDialogOpen = false"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
