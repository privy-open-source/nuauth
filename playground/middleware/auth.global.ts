/* eslint-disable @typescript-eslint/promise-function-async */
import { defineNuxtRouteMiddleware } from '#imports'
import { useNuAuth } from '@privyid/nuauth'

export default defineNuxtRouteMiddleware(() => {
  const { token, login } = useNuAuth()

  if (!token.value)
    return login()
})
