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

const tasksFromServer = ref();
const isModalOpen = ref(false);
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
  </div>
</template>
