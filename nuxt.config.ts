// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/supabase",
    "nuxt-icon",
    "@nuxtjs/color-mode",
    "@formkit/auto-animate/nuxt",
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

  compatibilityDate: "2024-08-05",
  ssr: false,
});
