import {
  getHeader,
  send,
  sendRedirect,
  type H3Event,
} from 'h3'
import {
  decodePath,
  parseURL,
  isScriptProtocol,
  joinURL,
  withBase,
} from 'ufo'
import { useRuntimeConfig } from '#imports'
import getURL from 'requrl'
import { env } from 'std-env'
import type { CookieSerializeOptions } from 'cookie-es'
import { LoadingPage } from './pages'

/**
 * get redirect page after success login
 * @param profile
 * @param redirect
 * @returns
 */
export function getHomeURL (profile: string, redirect?: string): string {
  try {
    if (redirect) {
      const whitelist = getEnv(profile, 'REDIRECT_WHITELIST').split(';')
      const path      = decodePath(redirect)
      const url       = parseURL(path)

      if (!isScriptProtocol(url.protocol)) {
        if (url.host && whitelist.includes(url.host))
          return path

        if (!url.host && url.pathname)
          return path
      }
    }
  } catch (error) {
    if (import.meta.env.DEV)
      console.warn(error)
  }

  return getEnv(profile, 'HOME', '/')
}

/**
 * Get current baseUrl
 * @param event H3Event
 */
export function getBase (event: H3Event) {
  const config  = useRuntimeConfig()
  const baseURL = getURL(event.node.req)

  return joinURL(baseURL, config.app.baseURL)
}

/**
 * Get profile's env
 * @param profile profile name
 * @param name env name
 * @param [defaultValue=''] default value
 */
export function getEnv (profile: string, name: string, defaultValue = ''): string {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return env[`${profile.toUpperCase()}_${name.toUpperCase()}`] || defaultValue
}

/**
 * Get profile's env with fallback
 * @param profile profile name
 * @param name env name
 */
export function getEnvs (profile: string, names: string[], defaultValue = ''): string {
  for (const name of names) {
    const value = getEnv(profile, name)

    if (value)
      return value
  }

  return defaultValue
}

/**
 * Get redirect / callback Uri
 * @param profile
 */
export function getRedirectUri (profile: string, event: H3Event): string {
  const baseURL     = getBase(event)
  const redirectUrl = getEnv(profile, 'REDIRECT_URI', '/auth/callback')

  return withBase(redirectUrl, baseURL)
}

/**
 * Redirect to target url with cookie samesite strict protection
 * @param event H3Event
 * @param url redirect url
 * @param cookieConfig cookie config
 */
export async function sendRedirectPage (event: H3Event, url: string, cookieConfig: CookieSerializeOptions) {
  const isCookieStrict = cookieConfig.sameSite === 'strict' || cookieConfig.sameSite === true
  const isIframe       = getHeader(event, 'sec-fetch-dest') === 'iframe'

  if (isCookieStrict || isIframe) {
    // Use meta refresh as redirection to fix issue with cookies samesite=strict
    // See: https://stackoverflow.com/questions/42216700/how-can-i-redirect-after-oauth2-with-samesite-strict-and-still-get-my-cookies
    await send(event, LoadingPage(url), 'text/html')

    return
  }

  await sendRedirect(event, url)
}
