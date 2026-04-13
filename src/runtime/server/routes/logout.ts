import type { CookieSerializeOptions } from 'cookie-es'
import {
  defineEventHandler,
  getQuery,
  setCookie,
  sendRedirect,
  deleteCookie,
  createError,
  setResponseStatus,
  send,
  type H3Error,
} from 'h3'
import { withQuery } from 'ufo'
import { useRuntimeConfig } from '#imports'
import { getRedirectUri, getEnv } from '../utils'
import { ErrorPage } from '../utils/pages'

export default defineEventHandler(async (event) => {
  try {
    const config  = useRuntimeConfig()
    const query   = getQuery(event)
    const profile = String(query.profile ?? config.public.defaultProfile ?? 'oauth')

    if (!config.nuauth?.profile.names.includes(profile)) {
      throw createError({
        status : 400,
        message: `Unknown oauth profile: ${profile}`,
      })
    }

    const baseURL     = getEnv(profile, 'LOGOUT_URI')
    const clientId    = getEnv(profile, 'CLIENT_ID')
    const scope       = getEnv(profile, 'SCOPE', 'public read')
    const register    = getEnv(profile, 'REGISTER')
    const redirectUri = getRedirectUri(profile, event)
    const state       = JSON.stringify(query ?? {})

    const logoutURL = withQuery(baseURL, {
      response_type: 'code',
      client_id    : clientId,
      redirect_uri : redirectUri,
      scope,
      state,
      register,
    })

    const cookieConfig = (config.nuauth.cookie ?? {}) as CookieSerializeOptions

    deleteCookie(event, `${profile}/token`, cookieConfig)
    deleteCookie(event, `${profile}/refresh-token`, cookieConfig)
    deleteCookie(event, `${profile}/expires`, cookieConfig)

    // Save temp state into cookie
    setCookie(event, '_state', state)

    await sendRedirect(event, logoutURL)
  } catch (error) {
    await event.context.nuauth?.callHook('error', error)

    if (!event.handled) {
      const code    = (error as H3Error).statusCode ?? 500
      const message = (error as H3Error).message ?? 'Unknown rrror'

      setResponseStatus(event, code)

      await send(event, ErrorPage(message, code), 'text/html')
    }
  }
})
