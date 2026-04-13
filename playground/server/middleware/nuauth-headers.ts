import { defineEventHandler } from '#imports'
import { randomUUID } from 'node:crypto'
import { onNuAuth } from '@privyid/nuauth/server'

export default defineEventHandler((event) => {
  onNuAuth(event, 'request:token', ({ options }) => {
    options.headers.set('X-Request-ID', randomUUID())
  })
})
