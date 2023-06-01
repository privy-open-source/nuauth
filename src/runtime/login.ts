import {
  defineEventHandler,
  getQuery,
  sendRedirect,
  setResponseStatus,
} from 'h3'
import { withQuery } from 'ufo'
import { useRuntimeConfig } from '#imports'
import { getEnv } from '../core/utils'
import { getClient } from '../core/client'

export default defineEventHandler(async (event) => {
  try {
    const config  = useRuntimeConfig()
    const query   = getQuery(event)
    const profile = String(query.profile ?? config.public.defaultProfile ?? 'oauth')

    if (!config.nuauth?.profile.names.includes(profile))
      throw new Error(`Unknown oauth profile: ${profile}`)

    const client       = getClient(profile)
    const authorizeURL = client.authorizeURL({
      redirect_uri: getEnv(profile, 'REDIRECT_URI'),
      scope       : getEnv(profile, 'SCOPE') || 'public read',
      state       : query ? JSON.stringify(query) : '{}',
    })

    const register = getEnv(profile, 'REGISTER')
    const loginURL = withQuery(authorizeURL, { register })

    await sendRedirect(event, loginURL)
  } catch (error) {
    setResponseStatus(event, 500)

    return {
      code   : 500,
      message: (error as Error).message,
    }
  }
})
