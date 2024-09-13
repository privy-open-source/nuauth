import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules   : ['../src/module'],
  alias     : { '@privyid/nuauth/core': fileURLToPath(new URL('../src/core', import.meta.url)) },
  typescript: {
    tsConfig: {
      compilerOptions: {
        strict          : false,
        strictNullChecks: true,
      },
    },
  },
  nuauth: { profile: { names: ['oauth', 'gitlab'] } },

  compatibilityDate: '2024-09-13',
})
