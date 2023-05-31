import type { CookieSerializeOptions } from 'cookie-es'
import {
  defineEventHandler,
  getQuery,
  sendRedirect,
  deleteCookie,
} from 'h3'
import { withQuery } from 'ufo'
import { useRuntimeConfig } from '#imports'
import { getEnv } from '../core/utils'

export default defineEventHandler(async (event) => {
  const config  = useRuntimeConfig()
  const query   = getQuery(event)
  const profile = String(query.profile ?? 'oauth')

  if (!config.nuauth?.profiles.includes(profile))
    throw new Error(`Unknown oauth profile: ${profile}`)

  const logoutUrl = withQuery(getEnv(profile, 'LOGOUT_URI'), {
    response_type: 'code',
    client_id    : getEnv(profile, 'CLIENT_ID'),
    redirect_uri : getEnv(profile, 'REDIRECT_URI'),
    scope        : getEnv(profile, 'SCOPE') || 'public read',
    state        : query ? JSON.stringify(query) : '{}',
  })

  const cookieConfig = (config.nuauth.cookie ?? {}) as CookieSerializeOptions

  deleteCookie(event, `${profile}/token`, cookieConfig)
  deleteCookie(event, `${profile}/refresh-token`, cookieConfig)
  deleteCookie(event, `${profile}/expires`, cookieConfig)

  await sendRedirect(event, logoutUrl)
})
