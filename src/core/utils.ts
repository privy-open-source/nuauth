import { setHeader, type H3Event } from 'h3'
import {
  decodePath,
  parseURL,
  isScriptProtocol,
  joinURL,
  withBase,
} from 'ufo'
import { useRuntimeConfig } from '#imports'
import getURL from 'requrl'

export function getHomeURL (profile: string, redirect?: string): string {
  try {
    if (redirect) {
      const whitelist = (getEnv(profile, 'REDIRECT_WHITELIST') || '').split(';')
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

  return getEnv(profile, 'HOME') || '/'
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
 */
export function getEnv (profile: string, name: string): string {
  return import.meta.env[`${profile.toUpperCase()}_${name.toUpperCase()}`]
}

/**
 * Get redirect / callback Uri
 * @param profile
 */
export function getRedirectUri (profile: string, event: H3Event): string {
  const baseURL     = getBase(event)
  const redirectUrl = getEnv(profile, 'REDIRECT_URI') || '/auth/callback'

  return withBase(redirectUrl, baseURL)
}

export function setNoCache (event: H3Event) {
  setHeader(event, 'cache-control', 'no-cache, no-store, must-revalidate')
  setHeader(event, 'pragma', 'no-cache')
  setHeader(event, 'expires', '0')
}
