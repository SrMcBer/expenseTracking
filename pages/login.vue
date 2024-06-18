<script setup lang="ts">
const user = useSupabaseUser();
const { auth } = useSupabaseClient();

const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`;
const showPassword = ref(false);
const email = ref("");
const password = ref("");
watchEffect(() => {
  if (user.value) {
    navigateTo("/tasks");
  }
});
const signIn = async () => {
  const { data, error } = await auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (data) {
    navigateTo("/tasks");
  }
  if (error) {
    console.error(error);
  }
};
</script>

<template>
  <Card class="w-[350px]">
    <CardHeader>
      <CardTitle>Log In</CardTitle>
      <CardDescription>Ingresa a la aplicación</CardDescription>
    </CardHeader>
    <CardContent>
      <form>
        <div class="grid w-full items-center gap-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="email">Correo</Label>
            <Input
              id="email"
              placeholder="Email"
              type="email"
              v-model="email"
            />
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="pass">Contraseña</Label>
            <div class="flex gap-4">
              <Input
                id="pass"
                placeholder="Password"
                :type="showPassword ? 'text' : 'password'"
                v-model:model-value="password"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="icon"
                      @click.prevent="showPassword = !showPassword"
                    >
                      <Icon
                        :name="showPassword ? 'ph:eye-closed' : 'ph:eye'"
                        class="size-6"
                      ></Icon>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p v-if="showPassword">Ocultar Contraseña</p>
                    <p v-else="showPassword">Mostrar Contraseña</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </form>
    </CardContent>
    <CardFooter class="flex justify-between px-6 pb-6">
      <Button
        class="w-full"
        @click="signIn"
        :disabled="email.length < 10 || password.length < 4"
        >Ingresar</Button
      >
    </CardFooter>
  </Card>
</template>
