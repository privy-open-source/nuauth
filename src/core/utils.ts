import { getRequestURL } from 'h3'
import { useRequestEvent } from '#imports'
import { defu } from 'defu'
import {
  decodePath,
  parseURL,
  stringifyParsedURL,
} from 'ufo'

export function getHomeURL (profile: string, redirect?: string): string {
  try {
    if (redirect) {
      const whitelist = (getEnv(profile, 'REDIRECT_WHITELIST') || '').split(';')
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

  return getEnv(profile, 'HOME') || '/'
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
export function getRedirectUri (profile: string): string {
  const event       = useRequestEvent()
  const redirectUrl = getEnv(profile, 'REDIRECT_URI') || '/auth/callback'
  const url         = parseURL(redirectUrl)
  const requestUrl  = getRequestURL(event)

  return stringifyParsedURL(defu(url, {
    protocol: requestUrl.protocol,
    host    : requestUrl.host,
  }))
}
