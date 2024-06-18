<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-800">
    <Header />
    <div class="mx-auto min-h-screen max-w-xl px-4 sm:px-6 lg:px-8">
      <div class="-mt-[3.125rem] flex min-h-screen items-center justify-center">
        <slot />
      </div>
    </div>
  </div>
</template>
