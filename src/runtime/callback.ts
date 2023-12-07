import {
  defineEventHandler,
  getQuery,
  getCookie,
  setCookie,
  deleteCookie,
  setResponseStatus,
  sendRedirect,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import defu from 'defu'
import destr from 'destr'
import type { CookieSerializeOptions } from 'cookie-es'
import {
  getBase,
  getEnv,
  getHomeURL,
  getRedirectUri,
} from '../core/utils'
import sendRedirectPage from '../core/redirect'
import { getClient } from '../core/client'
import { withBase } from 'ufo'

export default defineEventHandler(async (event) => {
  try {
    const config  = useRuntimeConfig()
    const query   = getQuery(event)
    const state   = destr<Record<string, string>>(query.state ?? getCookie(event, '_state')) ?? {}
    const profile = String(state.profile ?? config.public.defaultProfile ?? 'oauth')

    if (!config.nuauth?.profile.names.includes(profile))
      throw new Error(`Unknown oauth profile: ${profile}`)

    const client  = getClient(profile)
    const baseURL = getBase(event)
    const homeURL = getHomeURL(profile, state.redirect)

    if (query.errors === 'access_denied') {
      const deniedURL = getEnv(profile, 'DENIED_REDIRECT') || homeURL

      await sendRedirect(event, withBase(deniedURL, baseURL))

      return
    }

    const access = await client.getToken({
      code        : query.code as string,
      redirect_uri: getRedirectUri(profile, event),
      scope       : getEnv(profile, 'SCOPE') || 'public read',
    })

    const token        = access.token.access_token as string
    const refreshToken = access.token.refresh_token as string
    const expires      = access.token.expires_at as Date
    const cookieConfig = defu(config.nuauth.cookie, { expires }) as CookieSerializeOptions

    setCookie(event, `${profile}/token`, token, cookieConfig)
    setCookie(event, `${profile}/refresh-token`, refreshToken, cookieConfig)
    setCookie(event, `${profile}/expires`, expires.toISOString(), cookieConfig)

    if (state.enterprise)
      setCookie(event, `${profile}/enterprise-token`, state.enterprise)

    // Remove temporary state
    deleteCookie(event, '_state')

    await sendRedirectPage(event, withBase(homeURL, baseURL), cookieConfig)
  } catch (error) {
    setResponseStatus(event, 500)

    return {
      code   : 500,
      message: (error as Error).message,
    }
  }
})
