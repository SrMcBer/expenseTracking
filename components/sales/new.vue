<script setup lang="ts">
import type { Database } from "@/types/database.types";
import { toast } from "vue-sonner";

const client = useSupabaseClient<Database>();

const { data: products } = await useAsyncData("products", async () => {
  const { data } = await client.from("Product").select().order("id");
  return data;
});

const { data: users } = await useAsyncData("users", async () => {
  const { data } = await client.from("Users").select().order("id");
  return data;
});

const { data: accounts } = await useAsyncData("accounts", async () => {
  const { data } = await client.from("Account").select().order("id");
  return data;
});

const loading = ref(false);
const isDialogOpen = ref(false);

const vendedor = ref("");
const total = computed(() =>
  sales_details.value.reduce(
    (acc, curr) => acc + curr.valor * curr.cantidad,
    0,
  ),
);
const nota = ref("");

const sales_details = ref<
  {
    product: string;
    cantidad: number;
    valor: number;
  }[]
>([]);

const payment_structure = ref<
  {
    account_id: number;
    amount: number;
  }[]
>([]);

const addSaleDet = () => {
  sales_details.value.push({ product: "", cantidad: 0, valor: 0 });
};
const removeProd = (index: number) => {
  sales_details.value.splice(index, 1);
};

const addPayment = () => {
  payment_structure.value.push({ account_id: 0, amount: 0 });
};
const removePayment = (index: number) => {
  payment_structure.value.splice(index, 1);
};

const validateSaleData = () => {
  if (!products.value) {
    toast.error("No hay productos");
    return false;
  }
  if (!vendedor.value) {
    toast.error("El vendedor es requerido");
    return false;
  }
  if (!total.value) {
    toast.error("El total es requerido");
    return false;
  }
  if (!sales_details.value.length) {
    toast.error("Debes agregar al menos un producto");
    return false;
  }
  if (!payment_structure.value.length) {
    toast.error("Debes seleccionar una cuenta");
    return false;
  }
  for (const saleProd of sales_details.value) {
    if (!saleProd.product) {
      toast.error("Debes seleccionar un producto");
      return false;
    }
    const prodData = products.value.find(
      (prod) => prod.name === saleProd.product,
    );
    if (!prodData) {
      toast.error("No se encontro el producto");
      return false;
    }
    if (prodData.inventory === 0) {
      toast.error(`Producto ${prodData.name} sin inventario`);
      return false;
    }
    if (!saleProd.cantidad) {
      toast.error("Debes ingresar una cantidad");
      return false;
    }
    if (!saleProd.valor) {
      toast.error("Debes ingresar un valor");
      return false;
    }
  }
  return true;
};

const createSale = async (saleObj: {
  note: string;
  total: number;
  username: string;
}) => {
  const { data, error } = await client.from("Sales").upsert(saleObj).select();
  if (error) {
    toast.error("Error al crear la venta");
    return false;
  }
  if (!data) {
    toast.error("Error al crear la venta");
    return false;
  }
  return data[0].id;
};

const createDet = async (saleDet: {
  product_id: number;
  quantity: number;
  sale_id: number;
  total: number;
  value: number;
}) => {
  const { error } = await client.from("Sales_Det").upsert(saleDet);
  if (error) {
    console.error(error);
    toast.error("Error al crear detalle de la venta");
    return false;
  }
  return true;
};

const updateProd = async (prod_id: number, quantity: number) => {
  if (!products.value) {
    console.log("No hay productos");
    return false;
  }
  const prod = products.value.find((prod) => prod.id === prod_id);
  if (!prod) {
    console.log("No se encontro el producto");
    return false;
  }
  if (prod.inventory === null) return false;
  const newInventory = prod.inventory - quantity;
  const { error } = await client
    .from("Product")
    .update({ inventory: newInventory })
    .eq("id", prod_id);
  if (error) {
    console.error(error);
    toast.error("Error al actualizar el inventario");
    return false;
  }
  return true;
};

const updateAcc = async (account_id: number, total: number) => {
  if (!accounts.value) return false;
  const account = accounts.value.find((acc) => acc.id === account_id);
  if (!account || !account.saldo) return false;
  const newBalance = account.saldo + total;
  const { error } = await client
    .from("Account")
    .update({ saldo: newBalance })
    .eq("id", account_id);
  if (error) {
    console.error(error);
    toast.error("Error al actualizar la cuenta");
    return false;
  }
  return true;
};

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
