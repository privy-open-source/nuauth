import {
  defineEventHandler,
  getQuery,
  getCookie,
  setCookie,
  deleteCookie,
  setResponseStatus,
  sendRedirect,
  getProxyRequestHeaders,
  send,
  createError,
  type H3Error,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import defu from 'defu'
import destr from 'destr'
import { type FetchError, ofetch } from 'ofetch'
import type { CookieSerializeOptions } from 'cookie-es'
import {
  getBase,
  getEnv,
  getHomeURL,
  getRedirectUri,
  sendRedirectPage,
  getEnvs,
} from '../utils'

import { withBase } from 'ufo'
import type { RawAccessToken } from '../../../server'
import { ErrorPage } from '../utils/pages'

export default defineEventHandler(async (event) => {
  try {
    const config  = useRuntimeConfig()
    const query   = getQuery(event)
    const state   = destr<Record<string, string>>(query.state ?? getCookie(event, '_state')) ?? {}
    const profile = String(state.profile ?? config.public.defaultProfile ?? 'oauth')

    if (!config.nuauth?.profile.names.includes(profile)) {
      throw createError({
        status : 400,
        message: `Unknown oauth profile: ${profile}`,
      })
    }

    const baseURL = getBase(event)
    const homeURL = getHomeURL(profile, state.redirect)

    if (query.errors === 'access_denied') {
      await sendRedirect(event, withBase(getEnv(profile, 'DENIED_REDIRECT', homeURL), baseURL))

      return
    }

    const host         = getEnvs(profile, ['TOKEN_HOST', 'HOST'])
    const path         = getEnv(profile, 'TOKEN_PATH', '/oauth/token')
    const clientId     = getEnv(profile, 'CLIENT_ID')
    const clientSecret = getEnv(profile, 'CLIENT_SECRET')
    const scope        = getEnv(profile, 'SCOPE', 'public read')
    const redirectUri  = getRedirectUri(profile, event)

    const form = new URLSearchParams()

    form.set('response_type', 'code')
    form.set('grant_type', 'authorization_code')
    form.set('client_id', clientId)
    form.set('client_secret', clientSecret)
    form.set('code', query.code as string)
    form.set('scope', scope)
    form.set('redirect_uri', redirectUri)

    const rawToken = await ofetch<RawAccessToken>(path, {
      baseURL  : host,
      method   : 'POST',
      body     : form,
      headers  : getProxyRequestHeaders(event),
      onRequest: async (ctx) => {
        await event.context.nuauth?.callHook('request:token', ctx)
      },
    })

    const token        = rawToken.access_token
    const refreshToken = rawToken.refresh_token
    const expires      = new Date(Date.now() + rawToken.expires_in * 1000)
    const cookieConfig = defu(config.nuauth.cookie, { expires }) as CookieSerializeOptions

    setCookie(event, `${profile}/token`, token, cookieConfig)
    setCookie(event, `${profile}/refresh-token`, refreshToken, cookieConfig)
    setCookie(event, `${profile}/expires`, expires.toISOString(), cookieConfig)

    if (typeof state.enterprise === 'string') {
      if (state.enterprise)
        setCookie(event, `${profile}/enterprise-token`, state.enterprise)
      else
        deleteCookie(event, `${profile}/enterprise-token`)
    }

    // Remove temporary state
    deleteCookie(event, '_state')

    await event.context.nuauth?.callHook('token', {
      token,
      refreshToken,
      expires,
      _raw: rawToken,
    })

    if (!event.handled)
      await sendRedirectPage(event, withBase(homeURL, baseURL), cookieConfig)
  } catch (error) {
    await event.context.nuauth?.callHook('error', error)

    if (!event.handled) {
      const code    = (error as H3Error).statusCode ?? 500
      const message = (error as FetchError).data?.message ?? (error as H3Error).message ?? 'Unknown rrror'

      setResponseStatus(event, code)

      await send(event, ErrorPage(message, code), 'text/html')
    }
  }
})
