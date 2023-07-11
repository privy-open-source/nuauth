import { type H3Event, getRequestURL } from 'h3'
import { decodePath, parseURL } from 'ufo'

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

export function getEnv (profile: string, name: string): string {
  return import.meta.env[`${profile.toUpperCase()}_${name.toUpperCase()}`]
}

export function getRedirectUri (event: H3Event, profile: string): string {
  const redirectUrl = getEnv(profile, 'REDIRECT_URI') || '/auth/callback'
  const url         = parseURL(redirectUrl)
  const requestUrl  = getRequestURL(event)

  const protocol = `${url.protocol ?? requestUrl.protocol}//`
  const host     = `${url.host ?? requestUrl.host}`
  const path     = `${url.pathname}`

  return `${protocol}${host}${path}`
}
