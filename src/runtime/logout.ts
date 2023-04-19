import type { CookieSerializeOptions } from 'cookie-es'
import {
  defineEventHandler,
  getQuery,
  sendRedirect,
  deleteCookie,
} from 'h3'
import { withQuery } from 'ufo'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query  = getQuery(event)

  const logoutUrl = withQuery(import.meta.env.OAUTH_LOGOUT_URI, {
    response_type: 'code',
    client_id    : import.meta.env.OAUTH_CLIENT_ID,
    redirect_uri : import.meta.env.OAUTH_REDIRECT_URI,
    scope        : import.meta.env.OAUTH_SCOPE || 'public read',
    state        : query ? JSON.stringify(query) : '{}',
  })

  const cookieConfig: CookieSerializeOptions = config.nuauth.cookie ?? {}

  deleteCookie(event, 'session/token', cookieConfig)
  deleteCookie(event, 'session/refresh-token', cookieConfig)
  deleteCookie(event, 'session/expires', cookieConfig)

  await sendRedirect(event, logoutUrl)
})
