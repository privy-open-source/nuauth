import {
  defineEventHandler,
  getCookie,
  setCookie,
  setResponseStatus,
  getQuery,
} from 'h3'
import defu from 'defu'
import { useRuntimeConfig } from '#imports'
import type { CookieSerializeOptions } from 'cookie-es'
import { getClient } from '../core/client'
import { setNoCache } from '../core/utils'

export default defineEventHandler(async (event) => {
  try {
    const config  = useRuntimeConfig()
    const query   = getQuery(event)
    const profile = String(query.profile ?? config.public.defaultProfile ?? 'oauth')

    if (!config.nuauth?.profile.names.includes(profile))
      throw new Error(`Unknown oauth profile: ${profile}`)

    const client = getClient(profile)
    const access = await client.createToken({
      access_token : getCookie(event, `${profile}/token`),
      refresh_token: getCookie(event, `${profile}/refresh-token`),
      expires_at   : getCookie(event, `${profile}/expired`),
    }).refresh()

    const token        = access.token.access_token as string
    const refreshToken = access.token.refresh_token as string
    const expires      = access.token.expires_at as Date
    const cookieConfig = defu(config.nuauth.cookie, { expires }) as CookieSerializeOptions

    setCookie(event, `${profile}/token`, token, cookieConfig)
    setCookie(event, `${profile}/refresh-token`, refreshToken, cookieConfig)
    setCookie(event, `${profile}/expires`, expires.toISOString(), cookieConfig)
    setNoCache(event)

    return {
      code   : 200,
      message: 'Ok',
      data   : {
        access_token : access.token.access_token,
        refresh_token: access.token.refresh_token,
        expires      : access.token.expires_at,
      },
    }
  } catch (error) {
    setResponseStatus(event, 500)

    return {
      code   : 500,
      message: (error as Error).message,
    }
  }
})
