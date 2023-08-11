import { defu } from 'defu'
import type { CookieSerializeOptions } from 'cookie-es'
import {
  addImports,
  addRouteMiddleware,
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
   *
   */
  profile: {
    /**
     * Default profile
     * @default
     * 'oauth'
     */
    default?: string,
    /**
     * Oauth server profile's names
     * @default
     * ['oauth']
     */
    names?: string[],
  },
  /**
   * Add guard middleware
   * @default true
   */
  middleware?: boolean,
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name         : '@privyid/nuauth',
    configKey    : 'nuauth',
    compatibility: { nuxt: '^3.0.0' },
  },
  defaults: {
    autoImport: true,
    cookie    : {
      httpOnly: true,
      sameSite: true,
      path    : '/',
      secure  : false,
    },
    profile: {
      default: 'oauth',
      names  : ['oauth'],
    },
    middleware: true,
  },
  setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.nuauth                = defu(nuxt.options.runtimeConfig.nuauth, options) as unknown as typeof nuxt.options.runtimeConfig.nuauth
    nuxt.options.runtimeConfig.public.defaultProfile = options.profile.default as string

    addServerHandler({ route: '/auth/login', handler: resolve('./runtime/login') })
    addServerHandler({ route: '/auth/callback', handler: resolve('./runtime/callback') })
    addServerHandler({ route: '/auth/refresh', handler: resolve('./runtime/refresh') })
    addServerHandler({ route: '/auth/logout', handler: resolve('./runtime/logout') })

    if (options.autoImport) {
      addImports({
        name: 'useNuAuth',
        from: resolve('./core/index'),
      })
    }

    if (options.middleware) {
      addRouteMiddleware({
        global: true,
        name  : 'nuauth',
        path  : resolve('./runtime/middleware'),
      })
    }
  },
})
