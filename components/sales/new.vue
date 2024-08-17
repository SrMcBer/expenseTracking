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
    account_name: string;
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
  payment_structure.value.push({ account_name: "", amount: 0 });
};
const removePayment = (index: number) => {
  payment_structure.value.splice(index, 1);
};

const generateSale = async () => {
  const validated = validateSaleData();
  if (!validated) return;
  loading.value = true;
  const saleObj = {
    note: nota.value,
    total: total.value,
    username: vendedor.value,
  };

  const saleId = await createSale(saleObj);
  if (!saleId) return;

  const saleDetStatus = await createSaleDet(saleId);
  if (!saleDetStatus) return;

  const paymentStatus = await createPayments(saleId);
  if (!paymentStatus) return;

  loading.value = false;
  isDialogOpen.value = false;
  toast.success("Venta generada con exito");
};

const validateSaleData = () => {
  if (!accounts.value) {
    toast.error("No hay cuentas");
    return false;
  }
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
  const productNames = sales_details.value.map((saleProd) => saleProd.product);
  const uniqueProductNames = new Set(productNames);
  if (productNames.length !== uniqueProductNames.size) {
    toast.error("No puedes tener el mismo producto dos veces en la venta");
    return false;
  }

  const accountNames = payment_structure.value.map(
    (payment) => payment.account_name,
  );
  const uniqueAccountNames = new Set(accountNames);
  if (accountNames.length !== uniqueAccountNames.size) {
    toast.error("No puedes seleccionar la misma cuenta dos veces");
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
    if (!prodData.inventory) {
      toast.error(`Producto ${prodData.name} sin inventario`);
      return false;
    }
    if (!saleProd.cantidad) {
      toast.error("Debes ingresar una cantidad");
      return false;
    }
    if (saleProd.cantidad > prodData.inventory) {
      toast.error(`La cantidad de ${prodData.name} supera el inventario`);
      return false;
    }
    if (!saleProd.valor) {
      toast.error("Debes ingresar un valor");
      return false;
    }
  }
  for (const paymentInfo of payment_structure.value) {
    if (!paymentInfo.account_name) {
      toast.error("Debes seleccionar una cuenta");
      return false;
    }
    const accData = accounts.value.find(
      (acc) => acc.nombre === paymentInfo.account_name,
    );
    if (!accData) {
      toast.error("No se encontro la cuenta");
      return false;
    }
    if (paymentInfo.amount <= 0) {
      toast.error("El valor del pago debe ser mayor a 0");
      return false;
    }
  }
  const totalAmount = payment_structure.value.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  if (totalAmount !== total.value) {
    toast.error("El total de los pagos no coincide con el total de la venta");
    return false;
  }
  return true;
};

const createSaleDet = async (saleId: number) => {
  if (!saleId) return false;
  if (!products.value) return false;
  if (!sales_details.value) return false;
  for (const sale of sales_details.value) {
    const prodId = products.value.find(
      (prod) => prod.name === sale.product,
    )?.id;
    if (!prodId) {
      toast.error("No se encontro el producto");
      return false;
    }
    const saleDet = {
      product_id: prodId,
      quantity: sale.cantidad,
      sale_id: saleId,
      total: sale.cantidad * sale.valor,
      value: sale.valor,
    };
    const createDetStatus = await createDet(saleDet);
    if (!createDetStatus) return false;
    const updateStatus = await updateProd(prodId, sale.cantidad);
    if (!updateStatus) return false;
  }
  return true;
};

const createPayments = async (saleId: number) => {
  if (!saleId) return false;
  if (!accounts.value) return false;
  if (!payment_structure.value) return false;
  for (const payment of payment_structure.value) {
    const accId = accounts.value.find(
      (acc) => acc.nombre === payment.account_name,
    )?.id;
    if (!accId) {
      toast.error("No se encontro la cuenta");
      return false;
    }
    const createPaymentStatus = await createPayment(
      accId,
      saleId,
      payment.amount,
    );
    if (!createPaymentStatus) return false;
    const createFlowStatus = await createFlow(
      payment.amount,
      accId,
      `Venta ${saleId}`,
    );
    if (!createFlowStatus) return false;
    const updateAccStatus = await updateAcc(accId, payment.amount);
    if (!updateAccStatus) return false;
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
  if (!account || account.saldo == null) return false;
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

const createFlow = async (
  value: number,
  accountId: number,
  concept: string,
) => {
  const createObj = {
    debit: value,
    credit: 0,
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

const createPayment = async (
  account_id: number,
  sale_id: number,
  value: number,
) => {
  const paymentObj = {
    account_id: account_id,
    sale_id: sale_id,
    value: value,
  };
  const { error } = await client.from("Payment_Method").upsert(paymentObj);
  if (error) {
    toast.error("Error registrar debito");
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
    <DialogContent class="max-w-xl">
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
            <Select v-model:model-value="vendedor" id="vendedor">
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
                  <span class="w-2/12">Precio</span>
                  <span class="w-2/12"></span>
                </div>
              </div>
              <div
                class="flex max-h-[30rem] flex-col gap-2 overflow-scroll p-2"
              >
                <template v-for="(sale, index) in sales_details">
                  <div class="flex gap-2">
                    <Select v-model:model-value="sale.product">
                      <SelectTrigger class="w-9/12">
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
                      v-model:model-value="sale.cantidad"
                      class="w-2/12"
                    ></Input>
                    <Input
                      type="number"
                      min="0"
                      v-model:model-value="sale.valor"
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
              <Button
                variant="success"
                @click.prevent="addSaleDet"
                class="w-full"
              >
                <Icon name="ph:plus-circle" class="size-6" />
              </Button>
            </div>
          </div>
          <div class="w-full space-y-4">
            <div class="flex flex-col gap-2" v-auto-animate>
              <span>Pagos</span>
              <div>
                <div class="flex gap-2">
                  <span class="w-6/12">Cuenta</span>
                  <span class="w-2/12">Valor</span>
                </div>
              </div>
              <div
                class="flex max-h-[30rem] flex-col gap-2 overflow-scroll p-2"
              >
                <template v-for="(sale, index) in payment_structure">
                  <div class="flex gap-2">
                    <Select v-model:model-value="sale.account_name">
                      <SelectTrigger class="w-9/12">
                        <SelectValue placeholder="Selecciona una cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        <template v-for="acc in accounts" :key="acc.id">
                          <SelectItem :value="acc.nombre">
                            {{ acc.nombre }}
                          </SelectItem>
                        </template>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      v-model:model-value="sale.amount"
                      class="w-2/12"
                    ></Input>
                    <Button
                      variant="destructive"
                      size="icon"
                      @click="removePayment(index)"
                      class="rounded-full"
                    >
                      <Icon name="ph:x" class="size-6"></Icon>
                    </Button>
                  </div>
                </template>
              </div>
              <Button
                variant="success"
                @click.prevent="addPayment"
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
            <Button variant="success" :disabled="loading" @click="generateSale">
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
