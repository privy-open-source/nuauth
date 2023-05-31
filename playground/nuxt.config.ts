import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import MyModule from '../src/module'

export default defineNuxtConfig({
  modules   : [MyModule],
  alias     : { '@privyid/nuauth/core': fileURLToPath(new URL('../src/core', import.meta.url)) },
  typescript: {
    tsConfig: {
      compilerOptions: {
        strict          : false,
        strictNullChecks: true,
      },
    },
  },
  nuauth: { profiles: ['oauth', 'gitlab'] },
})
