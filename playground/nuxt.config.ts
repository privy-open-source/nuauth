import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import MyModule from '../src/module'

export default defineNuxtConfig({
  modules   : [MyModule],
  alias     : { '@privyid/nuauth': fileURLToPath(new URL('../src/', import.meta.url)) },
  typescript: {
    tsConfig: {
      compilerOptions: {
        strict          : false,
        strictNullChecks: true,
      },
    },
  },
})
