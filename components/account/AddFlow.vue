<script setup lang="ts">
import type { Account } from "@/types/types.ts";
import type { Database } from "@/types/database.types";
import { toast } from "vue-sonner";
import * as z from "zod";

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const props = defineProps<{ accounts: Account[] }>();

const accountsMap = computed(() => {
  return props.accounts.map((account) => account.nombre);
});

const AccountEnum = accountsMap.value.reduce(
  (enumObj: Record<string, string>, accountName) => {
    enumObj[accountName] = accountName;
    return enumObj;
  },
  {},
);

const formSchema = z.object({
  cuenta: z.nativeEnum(AccountEnum),
  monto: z.number().positive(),
  motivo: z.string().min(25).max(200),
});

const loading = ref(false);
const isDialogOpen = ref(false);

async function handleFlowAndAccount(
  createObj: Record<string, any>,
  updateAmount: number,
  accountId: number,
  successMessages: { flow: string; account: string },
  errorMessages: { flow: string; account: string },
) {
  loading.value = true;

  const createStatus = await createFlow(createObj);
  if (!createStatus) {
    toast.error(errorMessages.flow);
    loading.value = false;
    return false;
  }
  toast.success(successMessages.flow);

  const updateStatus = await updateAccount(updateAmount, accountId);
  if (!updateStatus) {
    toast.error(errorMessages.account);
    loading.value = false;
    return false;
  }
  toast.success(successMessages.account);

  loading.value = false;
  isDialogOpen.value = false;
  return true;
}

async function onSubmit(values: Record<string, any>, type: "debit" | "credit") {
  const account = props.accounts.find(
    (account) => account.nombre === values.cuenta,
  );
  if (!account) {
    return toast.error("Cuenta no encontrada");
  }

  const isDebit = type === "debit";
  const createObj = {
    debit: isDebit ? values.monto : 0,
    credit: isDebit ? 0 : values.monto,
    account_id: account.id,
    concept: values.motivo,
  };

  const updateAmount = isDebit
    ? values.monto + account.saldo
    : account.saldo - values.monto;

  const successMessages = {
    flow: isDebit ? "Debito registrado" : "Credito registrado",
    account: "Cuenta actualizada",
  };

  const errorMessages = {
    flow: isDebit ? "Error registrar debito" : "Error registrar credito",
    account: "Error actualizar cuenta",
  };

  await handleFlowAndAccount(
    createObj,
    updateAmount,
    account.id,
    successMessages,
    errorMessages,
  );
}

async function createFlow(createObj: Record<string, any>) {
  const { error } = await client.from("AssetFlow").upsert(createObj);
  if (error) {
    toast.error("Error registrar debito");
    return false;
  }
  return true;
}

async function updateAccount(monto: number, account_id: number) {
  const { error } = await client
    .from("Account")
    .update({ saldo: monto })
    .eq("id", account_id);

  if (error) {
    toast.error("Error actualizar cuenta");
    return false;
  }
  return true;
}

async function onSubmitDebit(values: Record<string, any>) {
  await onSubmit(values, "debit");
}

async function onSubmitCredit(values: Record<string, any>) {
  await onSubmit(values, "credit");
}
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button variant="success">
        <Icon name="ph:money" class="mr-2"></Icon> Nueva Transacción
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Transaccion Adicional</DialogTitle>
        <DialogDescription>
          Describa la transacción que desea agregar
        </DialogDescription>
      </DialogHeader>
      <Tabs default-value="Ingreso" class="w-full">
        <TabsList class="grid w-full grid-cols-2 rounded-xl bg-purple-300">
          <TabsTrigger
            class="[state=active]:bg-rose-400 rounded-xl"
            value="Ingreso"
          >
            Ingreso
          </TabsTrigger>
          <TabsTrigger
            class="[state=active]:bg-rose-400 rounded-xl"
            value="Egreso"
          >
            Egreso
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Ingreso">
          <div class="flex flex-col items-center space-x-2">
            <AutoForm
              :schema="formSchema"
              @submit="onSubmitDebit"
              class="w-full space-y-6"
            >
              <div class="flex items-center gap-4">
                <Button variant="success" :disabled="loading" type="submit">
                  <Icon
                    v-if="loading"
                    name="ph:arrow-clockwise"
                    class="mr-2 size-4 animate-spin"
                  ></Icon>
                  Generar Ingreso
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
        </TabsContent>
        <TabsContent value="Egreso">
          <div class="flex flex-col items-center space-x-2">
            <AutoForm
              :schema="formSchema"
              @submit="onSubmitCredit"
              class="w-full space-y-6"
            >
              <div class="flex items-center gap-4">
                <Button variant="success" :disabled="loading" type="submit">
                  <Icon
                    v-if="loading"
                    name="ph:arrow-clockwise"
                    class="mr-2 size-4 animate-spin"
                  ></Icon>
                  Generar Egreso
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
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
