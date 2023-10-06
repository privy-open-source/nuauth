import {
  defineEventHandler,
  getQuery,
  setCookie,
  setResponseStatus,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import defu from 'defu'
import type { CookieSerializeOptions } from 'cookie-es'
import { getHomeURL } from '../core/utils'
import sendRedirectPage from '../core/redirect'

export default defineEventHandler(async (event) => {
  try {
    const config  = useRuntimeConfig()
    const query   = getQuery(event)
    const profile = String(query.profile ?? config.public.defaultProfile ?? 'oauth')

    if (!config.nuauth?.profile.names?.includes(profile))
      throw new Error(`Unknown oauth profile: ${profile}`)

    const homeURL      = getHomeURL(profile, query.redirect as string)
    const token        = query.token as string
    const refreshToken = query.refreshToken as string
    const expires      = new Date(query.expires as string)
    const cookieConfig = defu(config.nuauth.cookie, { expires }) as CookieSerializeOptions

    setCookie(event, `${profile}/token`, token, cookieConfig)
    setCookie(event, `${profile}/refresh-token`, refreshToken, cookieConfig)
    setCookie(event, `${profile}/expires`, expires.toISOString(), cookieConfig)

    if (query.enterprise)
      setCookie(event, `${profile}/enterprise-token`, query.enterprise as string)

    await sendRedirectPage(event, homeURL, cookieConfig)
  } catch (error) {
    setResponseStatus(event, 500)

    return {
      code   : 500,
      message: (error as Error).message,
    }
  }
})
