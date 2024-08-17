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

const user = ref("");
const total = computed(() =>
  purchase_details.value.reduce(
    (acc, curr) => acc + curr.costo * curr.cantidad,
    0,
  ),
);
const concept = ref("");
const account_id = ref("");

const purchase_details = ref<
  {
    product: string;
    cantidad: number;
    costo: number;
  }[]
>([]);

const addPurchaseDet = () => {
  purchase_details.value.push({ product: "", cantidad: 0, costo: 0 });
};
const removeProd = (index: number) => {
  purchase_details.value.splice(index, 1);
};

const validateCompraData = () => {
  if (!user.value) {
    toast.error("Debes seleccionar un usuario");
    return false;
  }
  if (!concept.value) {
    toast.error("Debes ingresar un concepto");
    return false;
  }
  if (total.value <= 0) {
    toast.error("El total debe ser mayor a 0");
    return false;
  }
  if (!account_id.value) {
    toast.error("Debes seleccionar una cuenta");
    return false;
  }
  if (purchase_details.value.length === 0) {
    toast.error("Debes agregar al menos un producto");
    return false;
  }
  for (const purchase of purchase_details.value) {
    if (!purchase.product) {
      toast.error("Debes seleccionar un producto");
      return false;
    }
    if (purchase.cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return false;
    }
    if (purchase.costo <= 0) {
      toast.error("El costo debe ser mayor a 0");
      return false;
    }
  }
  if (
    total.value !=
    purchase_details.value.reduce(
      (acc, curr) => acc + curr.costo * curr.cantidad,
      0,
    )
  ) {
    toast.error("El total no coincide con la suma de los productos");
    return false;
  }
  return true;
};

const createComp = async (compraObj: {
  user: string;
  concept: string;
  total: number;
  url_factura: string;
  account_id: number;
}) => {
  const { data, error } = await client
    .from("Compra")
    .upsert(compraObj)
    .select();
  if (!data) {
    toast.error("Error al crear la compra");
    return false;
  }
  if (error) {
    console.error(error);
    toast.error("Error al crear la compra");
    return false;
  }
  return data[0].id;
};

const createDet = async (compraDet: {
  compra_id: number;
  producto_id: number;
  quantity: number;
  purchase_value: number;
}) => {
  const { data, error } = await client
    .from("Compra_Det")
    .upsert(compraDet)
    .select();
  if (!data) {
    toast.error("Error al crear la compra");
    return false;
  }
  if (error) {
    console.error(error);
    toast.error("Error al crear la compra");
    return false;
  }
  return true;
};

const updateProd = async (
  prod_id: number,
  inventory: number,
  costo: number,
) => {
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
  const newInventory = prod.inventory + inventory;
  const { data, error } = await client
    .from("Product")
    .update({ inventory: newInventory, purchase_price: costo })
    .eq("id", prod_id)
    .select();
  if (!data) {
    toast.error("Error al actualizar el inventario");
    return false;
  }
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
  if (!account || account.saldo == null) return false;
  const newBalance = account.saldo - total;
  const { data, error } = await client
    .from("Account")
    .update({ saldo: newBalance })
    .eq("id", account_id)
    .select();
  if (!data) {
    toast.error("Error al actualizar la cuenta");
    return false;
  }
  if (error) {
    console.error(error);
    toast.error("Error al actualizar la cuenta");
    return false;
  }
  return true;
};

const createCompraDet = async (compra_id: number) => {
  if (!products.value) return false;
  if (!purchase_details.value) return false;
  for (let purchase of purchase_details.value) {
    const prod_id = products.value.find(
      (prod) => prod.name === purchase.product,
    )?.id;
    if (!prod_id) return false;
    const compraDetObj = {
      compra_id: compra_id,
      producto_id: prod_id,
      quantity: purchase.cantidad,
      purchase_value: purchase.costo,
    };
    const createDetStatus = await createDet(compraDetObj);
    if (!createDetStatus) {
      console.log("Error al crear detalle de compra");
      return false;
    }

    const updateStatus = await updateProd(
      prod_id,
      purchase.cantidad,
      purchase.costo,
    );
    if (!updateStatus) {
      console.log("Error al actualizar producto");
      return false;
    }
  }
  return true;
};

const createFlow = async (
  value: number,
  accountId: number,
  concept: string,
) => {
  const createObj = {
    debit: 0,
    credit: value,
    account_id: accountId,
    concept: concept,
  };
  const { error } = await client.from("AssetFlow").upsert(createObj);
  if (error) {
    toast.error("Error registrar debito");
    return false;
  }
  return true;
};

const createCompra = async () => {
  const isValid = validateCompraData();
  loading.value = true;
  if (!isValid) return;
  if (!accounts.value) return;
  const accountId = accounts.value.find(
    (acc) => acc.nombre === account_id.value,
  )?.id;
  if (!accountId) return;
  const compraObj = {
    user: user.value,
    concept: concept.value,
    total: total.value,
    url_factura: "",
    account_id: accountId,
  };
  const compraId = await createComp(compraObj);
  if (!compraId) return;

  const CompraDetStatus = await createCompraDet(compraId);
  if (!CompraDetStatus) return;

  const AccStatus = await updateAcc(accountId, total.value);
  if (!AccStatus) return;

  const FlowStatus = await createFlow(total.value, accountId, concept.value);
  if (!FlowStatus) return;

  loading.value = false;
  isDialogOpen.value = false;
  toast.success("Compra generada con éxito");
};
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button variant="success">
        <Icon name="ph:trolley-suitcase" />
        Nueva Compra
      </Button>
    </DialogTrigger>
    <DialogContent class="max-w-xl">
      <DialogHeader>
        <DialogTitle>Compras</DialogTitle>
        <DialogDescription>
          Ingresa la información relacionada con la factura de compra
        </DialogDescription>
      </DialogHeader>
      <div class="flex w-full flex-col items-center space-x-2">
        <div class="flex w-full flex-col gap-4">
          <div class="flex w-full flex-col gap-2">
            <Label for="responsable">Usuario</Label>
            <Select v-model:model-value="user">
              <SelectTrigger>
                <SelectValue placeholder="usuario" />
              </SelectTrigger>
              <SelectContent>
                <template v-for="user in users" :key="user.id">
                  <SelectItem :value="user.username">
                    {{ user.username }}
                  </SelectItem>
                </template>
              </SelectContent>
            </Select>
          </div>
          <div class="flex w-full flex-col gap-2">
            <Label for="concept">Concepto</Label>
            <Input
              id="concept"
              type="text"
              placeholder="Motivo de la Factura"
              v-model:model-value="concept"
            />
          </div>
          <div class="flex w-full flex-col gap-2">
            <Label for="total">Total</Label>
            <Input
              id="total"
              type="number"
              placeholder="Total"
              v-model:model-value="total"
              disabled
            />
          </div>
          <div class="w-full space-y-4">
            <div class="flex flex-col gap-2" v-auto-animate>
              <span>Productos</span>
              <div>
                <div class="flex gap-2">
                  <span class="w-6/12">Producto</span>
                  <span class="w-2/12">Cantidad</span>
                  <span class="w-2/12">Costo</span>
                  <span class="w-2/12"></span>
                </div>
              </div>
              <div
                class="flex max-h-[30rem] flex-col gap-2 overflow-scroll p-2"
              >
                <template v-for="(purchase, index) in purchase_details">
                  <div class="flex gap-2">
                    <Select v-model:model-value="purchase.product">
                      <SelectTrigger class="w-6/12">
                        <SelectValue placeholder="Seleccionar un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <template v-for="prod in products" :key="prod.id">
                          <SelectItem :value="prod.name">
                            {{ prod.name }}
                          </SelectItem>
                        </template>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      v-model:model-value="purchase.cantidad"
                      class="w-2/12"
                    ></Input>
                    <Input
                      type="number"
                      min="0"
                      v-model:model-value="purchase.costo"
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
              </div>
              <Button variant="success" @click="addPurchaseDet" class="w-full">
                <Icon name="ph:plus-circle" class="size-6" />
              </Button>
            </div>
          </div>
          <div class="flex w-full flex-col gap-2">
            <Label for="cuenta">Cuenta</Label>
            <Select v-model:model-value="account_id" id="cuenta">
              <SelectTrigger>
                <SelectValue placeholder="Cuenta" />
              </SelectTrigger>
              <SelectContent>
                <template v-for="account in accounts" :key="account.id">
                  <SelectItem :value="account.nombre">
                    {{ account.nombre }}
                  </SelectItem>
                </template>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center gap-4">
            <Button variant="success" :disabled="loading" @click="createCompra">
              <Icon
                v-if="loading"
                name="ph:arrow-clockwise"
                class="mr-2 size-4 animate-spin"
              ></Icon>
              Generar Compra
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
