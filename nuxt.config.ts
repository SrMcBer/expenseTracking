// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/supabase",
    "nuxt-icon",
    "@nuxtjs/color-mode",
  ],
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
    },
  },
  colorMode: {
    classSuffix: "",
  },
});
