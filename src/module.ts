import {
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name         : '@privyid/nuauth',
    configKey    : 'nuauth',
    compatibility: { nuxt: '^3.0.0' },
  },
  setup () {
    const { resolve } = createResolver(import.meta.url)

    addServerHandler({ route: '/auth/login', handler: resolve('./runtime/login') })
    addServerHandler({ route: '/auth/callback', handler: resolve('./runtime/callback') })
    addServerHandler({ route: '/auth/refresh', handler: resolve('./runtime/refresh') })
    addServerHandler({ route: '/auth/logout', handler: resolve('./runtime/logout') })
  },
})
