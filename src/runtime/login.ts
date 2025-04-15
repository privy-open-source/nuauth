import {
  defineEventHandler,
  getQuery,
  setCookie,
  sendRedirect,
  setResponseStatus,
} from 'h3'
import { withQuery } from 'ufo'
import { useRuntimeConfig } from '#imports'
import {
  getEnv,
  getRedirectUri,
  setNoCache,
} from '../core/utils'
import { getClient } from '../core/client'

export default defineEventHandler(async (event) => {
  try {
    const config  = useRuntimeConfig()
    const query   = getQuery(event)
    const profile = String(query.profile ?? config.public.defaultProfile ?? 'oauth')

    if (!config.nuauth?.profile.names.includes(profile))
      throw new Error(`Unknown oauth profile: ${profile}`)

    const client       = getClient(profile)
    const state        = query ? JSON.stringify(query) : '{}'
    const authorizeURL = client.authorizeURL({
      redirect_uri: getRedirectUri(profile, event),
      scope       : getEnv(profile, 'SCOPE') || 'public read',
      state,
    })

    const register = getEnv(profile, 'REGISTER')
    const loginURL = withQuery(authorizeURL, { register })

    // Save temp state into cookie
    setCookie(event, '_state', state)
    setNoCache(event)

    await sendRedirect(event, loginURL)
  } catch (error) {
    setResponseStatus(event, 500)

    return {
      code   : 500,
      message: (error as Error).message,
    }
  }
})
