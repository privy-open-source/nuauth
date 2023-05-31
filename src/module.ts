import { defu } from 'defu'
import type { CookieSerializeOptions } from 'cookie-es'
import {
  addImports,
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Enable autoImport
   * @default true
   */
  autoImport: boolean,
  /**
   * Cookie serialize config
   * @default
   * {
   *   httpOnly: true,
   *   sameSite: true,
   *   path    : '/',
   *   secure  : false,
   * }
   */
  cookie: CookieSerializeOptions,
  /**
   * Oauth server profile
   * @default
   * ['oauth']
   */
  profiles: string[],
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name         : '@privyid/nuauth',
    configKey    : 'nuauth',
    compatibility: { nuxt: '^3.0.0' },
  },
  defaults: {
    autoImport: false,
    cookie    : {
      httpOnly: true,
      sameSite: true,
      path    : '/',
      secure  : false,
    },
    profiles: ['oauth'],
  },
  setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.nuauth = defu(nuxt.options.runtimeConfig.nuauth, options) as unknown as typeof nuxt.options.runtimeConfig.nuauth

    addServerHandler({ route: '/auth/login', handler: resolve('./runtime/login') })
    addServerHandler({ route: '/auth/callback', handler: resolve('./runtime/callback') })
    addServerHandler({ route: '/auth/refresh', handler: resolve('./runtime/refresh') })
    addServerHandler({ route: '/auth/logout', handler: resolve('./runtime/logout') })

    if (options.autoImport) {
      addImports({
        name: 'useNuAuth',
        from: resolve('./index'),
      })
    }
  },
})
