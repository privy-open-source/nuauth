import {
  defineEventHandler,
  getCookie,
  setCookie,
  createError,
} from 'h3'
import defu from 'defu'
import { AuthorizationCode } from 'simple-oauth2'
import { useRuntimeConfig } from '#imports'
import type { CookieSerializeOptions } from 'cookie-es'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const client = new AuthorizationCode({
      client: {
        id    : import.meta.env.OAUTH_CLIENT_ID,
        secret: import.meta.env.OAUTH_CLIENT_SECRET,
      },
      auth   : { tokenHost: import.meta.env.OAUTH_HOST },
      options: { authorizationMethod: 'body' },
    })

    const access = await client.createToken({
      access_token : getCookie(event, 'session/token'),
      refresh_token: getCookie(event, 'session/refresh-token'),
      expires_at   : getCookie(event, 'session/expired'),
    }).refresh()

    const token        = access.token.access_token as string
    const refreshToken = access.token.refresh_token as string
    const expires      = access.token.expires_at as Date
    const cookieConfig = defu(config.nuauth.cookie, { expires }) as CookieSerializeOptions

    setCookie(event, 'session/token', token, cookieConfig)
    setCookie(event, 'session/refresh-token', refreshToken, cookieConfig)
    setCookie(event, 'session/expires', expires.toISOString(), cookieConfig)

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
    return createError({
      statusCode: 500,
      message   : (error as Error).message,
    })
  }
})
