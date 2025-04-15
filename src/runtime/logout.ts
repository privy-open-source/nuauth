import type { CookieSerializeOptions } from 'cookie-es'
import {
  defineEventHandler,
  getQuery,
  setCookie,
  sendRedirect,
  deleteCookie,
} from 'h3'
import { withQuery } from 'ufo'
import { useRuntimeConfig } from '#imports'
import {
  getRedirectUri,
  getEnv,
  setNoCache,
} from '../core/utils'

export default defineEventHandler(async (event) => {
  const config  = useRuntimeConfig()
  const query   = getQuery(event)
  const profile = String(query.profile ?? config.public.defaultProfile ?? 'oauth')

  if (!config.nuauth?.profile.names.includes(profile))
    throw new Error(`Unknown oauth profile: ${profile}`)

  const state     = query ? JSON.stringify(query) : '{}'
  const logoutUrl = withQuery(getEnv(profile, 'LOGOUT_URI'), {
    response_type: 'code',
    client_id    : getEnv(profile, 'CLIENT_ID'),
    redirect_uri : getRedirectUri(profile, event),
    scope        : getEnv(profile, 'SCOPE') || 'public read',
    register     : getEnv(profile, 'REGISTER'),
    state,
  })

  const cookieConfig = (config.nuauth.cookie ?? {}) as CookieSerializeOptions

  deleteCookie(event, `${profile}/token`, cookieConfig)
  deleteCookie(event, `${profile}/refresh-token`, cookieConfig)
  deleteCookie(event, `${profile}/expires`, cookieConfig)

  // Save temp state into cookie
  setCookie(event, '_state', state)
  setNoCache(event)

  await sendRedirect(event, logoutUrl)
})
