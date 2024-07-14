<script setup lang="ts">
import { toast } from "vue-sonner";

const user = useSupabaseUser();
const { auth } = useSupabaseClient();

const showPassword = ref(false);
const email = ref("");
const password = ref("");

const showCreatePassword = ref(false);
const emailCreation = ref("");
const passwordCreation = ref("");
const passwordConfirmation = ref("");

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

const signUp = async () => {
  const { data, error } = await auth.signUp({
    email: emailCreation.value,
    password: passwordCreation.value,
    options: {
      data: {
        first_name: "Coneo",
        last_name: "estevez",
        age: 22,
      },
    },
  });
  if (data) {
    console.log("🚀 ~ file: login.vue:47 ~ signUp ~ data:", data);
    toast.success("User created successfully");
  }
  if (error) {
    toast.error(error.message);
    console.error(error);
  }
};
</script>

<template>
  <div class="flex gap-8">
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
    <Card class="w-[350px]">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Registrar tu usuario</CardDescription>
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
                v-model="emailCreation"
              />
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="pass">Contraseña</Label>
              <div class="flex gap-4">
                <Input
                  id="pass"
                  placeholder="Password"
                  :type="showCreatePassword ? 'text' : 'password'"
                  v-model:model-value="passwordCreation"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        @click.prevent="
                          showCreatePassword = !showCreatePassword
                        "
                      >
                        <Icon
                          :name="
                            showCreatePassword ? 'ph:eye-closed' : 'ph:eye'
                          "
                          class="size-6"
                        ></Icon>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p v-if="showCreatePassword">Ocultar Contraseña</p>
                      <p v-else>Mostrar Contraseña</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="passConfirmation">Confirmar Contraseña</Label>
              <div class="flex gap-4">
                <Input
                  id="passConfirmation"
                  placeholder="Password Confirmation"
                  :type="showCreatePassword ? 'text' : 'password'"
                  v-model:model-value="passwordConfirmation"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        @click.prevent="
                          showCreatePassword = !showCreatePassword
                        "
                      >
                        <Icon
                          :name="
                            showCreatePassword ? 'ph:eye-closed' : 'ph:eye'
                          "
                          class="size-6"
                        ></Icon>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p v-if="showCreatePassword">Ocultar Contraseña</p>
                      <p v-else>Mostrar Contraseña</p>
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
          class="w-full bg-emerald-500 hover:bg-emerald-600"
          :disabled="
            emailCreation.length < 10 ||
            passwordCreation.length < 4 ||
            passwordCreation !== passwordConfirmation ||
            passwordConfirmation.length < 4
          "
          @click="signUp"
        >
          Registrarse
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
