<script setup lang="ts">
import type { Database } from "@/types/database.types";
interface Task {
  id: number;
  title: string;
  completed: boolean;
  user?: string;
  created_at?: string;
}

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(false);
const newTask = ref("");

const { data: tasks } = await useAsyncData("tasks", async () => {
  if (!user.value) return;
  const { data } = await client
    .from("tasks")
    .select("id, title, completed")
    .eq("user", user.value.id)
    .order("created_at");
  return data;
});

async function addTask() {
  if (newTask.value.trim().length === 0) return;
  if (!user.value || !tasks.value) return;

  loading.value = true;

  const { data } = await client
    .from("tasks")
    .upsert({
      user: user.value.id,
      title: newTask.value,
      completed: false,
    })
    .select("id, title, completed")
    .single();
  if (!data) return;
  tasks.value.push(data);
  newTask.value = "";
  loading.value = false;
}

const completeTask = async (task: Task) => {
  await client
    .from("tasks")
    .update({ completed: task.completed })
    .match({ id: task.id });
};

const removeTask = async (task: Task) => {
  if (!tasks.value) return;
  tasks.value = tasks.value.filter((t) => t.id !== task.id);
  await client.from("tasks").delete().match({ id: task.id });
};
</script>

<template>
  <div class="my-[50%] w-full">
    <h1 class="mb-12 text-6xl font-bold">Todo List</h1>
    <form class="my-2 flex gap-2" @submit.prevent="addTask">
      <Input
        v-model:model-value="newTask"
        :loading="loading"
        class="w-full"
        placeholder="Nueva tarea"
      ></Input>
      <Button>Agregar</Button>
    </form>
    <Card v-if="tasks && tasks.length > 0">
      <CardHeader>
        <h2 class="text-2xl font-bold">Tareas</h2>
      </CardHeader>
      <CardContent>
        <ul>
          <li
            v-for="task of tasks"
            :key="task.id"
            class="divide-y divide-gray-200 my-4"
          >
            <div class="flex w-full gap-10">
              <span>{{ task.id }}</span>
              <span>{{ task.title }}</span>
              <Button size="icon" @click="completeTask(task)">
                <Icon
                  :name="`${task.completed ? 'ph:check' : 'ph:x'}`"
                  class="size-8"
                ></Icon>
              </Button>
              <Button
                size="icon"
                variant="destructive"
                @click="removeTask(task)"
              >
                <Icon name="ph:trash-fill" class="size-8"></Icon>
              </Button>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
