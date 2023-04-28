/* eslint-disable @typescript-eslint/promise-function-async */
import { defineNuxtRouteMiddleware } from '#imports'
import { useNuAuth } from '@privyid/nuauth'

export default defineNuxtRouteMiddleware((to) => {
  const { token, login } = useNuAuth()

  if (!token.value && to.name !== 'iframe')
    return login()
})
