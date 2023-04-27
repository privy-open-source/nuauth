import {
  defineEventHandler,
  getQuery,
  setCookie,
  sendRedirect,
  createError,
} from 'h3'
import { AuthorizationCode } from 'simple-oauth2'
import { parseURL, decodePath } from 'ufo'
import { useRuntimeConfig } from '#imports'
import defu from 'defu'
import type { CookieSerializeOptions } from 'cookie-es'

function getHomeURL (redirect?: string): string {
  try {
    if (redirect) {
      const whitelist = (import.meta.env.OAUTH_REDIRECT_WHITELIST || '').split(';')
      const path      = decodePath(redirect)
      const url       = parseURL(path)

      if (url.host && whitelist.includes(url.host))
        return path

      if (!url.host && url.pathname)
        return path
    }
  } catch (error) {
    if (import.meta.env.DEV)
      console.warn(error)
  }

  return import.meta.env.OAUTH_HOME || '/'
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const query  = getQuery(event)
    const client = new AuthorizationCode({
      client: {
        id    : import.meta.env.OAUTH_CLIENT_ID,
        secret: import.meta.env.OAUTH_CLIENT_SECRET,
      },
      auth   : { tokenHost: import.meta.env.OAUTH_HOST },
      options: { authorizationMethod: 'body' },
    })

    let state: Record<string, string>
    try {
      state = typeof query.state === 'string' ? JSON.parse(query.state) : {}
    } catch {
      state = {}
    }

    const homeURL = getHomeURL(state.redirect)
    const access  = await client.getToken({
      code        : query.code as string,
      redirect_uri: import.meta.env.OAUTH_REDIRECT_URI,
      scope       : import.meta.env.OAUTH_SCOPE || 'public read',
    })

    const token        = access.token.access_token as string
    const refreshToken = access.token.refresh_token as string
    const expires      = access.token.expires_at as Date
    const cookieConfig = defu(config.nuauth.cookie, { expires }) as CookieSerializeOptions

    setCookie(event, 'session/token', token, cookieConfig)
    setCookie(event, 'session/refresh-token', refreshToken, cookieConfig)
    setCookie(event, 'session/expires', expires.toISOString(), cookieConfig)

    if (state.enterprise)
      setCookie(event, 'session/enterprise-token', state.enteprise)

    await sendRedirect(event, homeURL)
  } catch (error) {
    return createError({
      statusCode: 500,
      message   : (error as Error).message,
    })
  }
})
