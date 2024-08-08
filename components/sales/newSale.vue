<script setup lang="ts">
import type { Database } from "@/types/database.types";
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import * as z from "zod";

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const { data: products } = await useAsyncData("products", async () => {
  if (!user.value) return;
  const { data } = await client.from("Product").select().order("id");
  return data;
});
const productsMap = computed(() => {
  if (!products.value) return [];
  return products.value.map((account) => account.name);
});

const formSchema = z.object({
  vendedor: z.string().min(5),
  total: z.number().min(0),
  nota: z.string().optional(),
});

const loading = ref(false);
const isDialogOpen = ref(false);

const vendedor = ref("");
const total = ref(0);
const nota = ref("");
const sales_details = ref<
  {
    product: string;
    cantidad: number;
  }[]
>([]);
const addSaleDet = () => {
  sales_details.value.push({ product: "", cantidad: 0 });
};
const removeProd = (index: number) => {
  sales_details.value.splice(index, 1);
};
async function onSubmit(values: Record<string, any>) {
  if (sales_details.value.length === 0) {
    toast.error("Debes agregar al menos un producto");
    return;
  }
  console.log("🚀 ~ file: newSale.vue:23 ~ onSubmit ~ values:", values);
}
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button variant="success">
        <Icon name="ph:currency-circle-dollar" class="mr-2"></Icon> Nueva Venta
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Ventas</DialogTitle>
        <DialogDescription>
          Ingresa el usuario que realizo la venta, seguido de los productos
        </DialogDescription>
      </DialogHeader>
      <div class="flex w-full flex-col items-center space-x-2">
        <div class="flex w-full flex-col gap-4">
          <div class="flex w-full flex-col gap-2">
            <Label for="vendedor">Vendedor</Label>
            <Input
              id="vendedor"
              type="text"
              placeholder="Nombre"
              v-model:model-value="vendedor"
            />
          </div>
          <div class="flex w-full flex-col gap-2">
            <Label for="total">Total</Label>
            <Input
              id="total"
              type="number"
              placeholder="Total"
              v-model:model-value="total"
            />
          </div>
          <div class="w-full space-y-4">
            <div class="flex flex-col gap-2" v-auto-animate>
              <span>Productos</span>
              <template v-for="(sale, index) in sales_details">
                <div class="flex gap-2">
                  <Select>
                    <SelectTrigger class="w-9/12">
                      <SelectValue placeholder="Seleccionar un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      <template v-for="prod in productsMap" :key="prod.id">
                        <SelectItem :value="prod">
                          {{ prod }}
                        </SelectItem>
                      </template>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    v-model:model-value="sale.cantidad"
                    class="w-2/12"
                  ></Input>
                  <Button
                    variant="destructive"
                    size="icon"
                    @click="removeProd(index)"
                    class="rounded-full"
                  >
                    <Icon name="ph:x" class="size-6"></Icon>
                  </Button>
                </div>
              </template>
              <Button
                variant="success"
                @click.prevent="addSaleDet"
                class="w-full"
              >
                <Icon name="ph:plus-circle" class="size-6" />
              </Button>
            </div>
          </div>
          <div class="flex w-full flex-col gap-2">
            <Label for="nota">Notas</Label>
            <Textarea
              placeholder="Detalles adicionales de la venta"
              id="nota"
              v-model:model-value="nota"
            />
          </div>
          <div class="flex items-center gap-4">
            <Button variant="success" :disabled="loading" type="submit">
              <Icon
                v-if="loading"
                name="ph:arrow-clockwise"
                class="mr-2 size-4 animate-spin"
              ></Icon>
              Generar venta
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
