/* eslint-disable @typescript-eslint/promise-function-async */
import { defineNuxtRouteMiddleware } from '#imports'
import { useNuAuth } from '@privyid/nuauth/core'

declare module '#app' {
  interface PageMeta {
    /**
     * Enable auth this page
     * @default true
     *
     * @example
     * // Enable auth
     * auth: true
     *
     * // Enable auth with other profile
     * auth: 'github'
     *
     * // Disable auth
     * auth: false
     */
    auth?: boolean | string,
  }
}

export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.auth !== false) {
    const profile          = typeof to.meta.auth === 'string' ? to.meta.auth : undefined
    const { token, login } = useNuAuth(profile)

    if (!token.value)
      return login(to.fullPath)
  }
})
