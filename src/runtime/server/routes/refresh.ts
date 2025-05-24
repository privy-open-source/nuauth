import {
  defineEventHandler,
  getCookie,
  setCookie,
  setResponseStatus,
  getQuery,
  getProxyRequestHeaders,
  createError,
  type H3Error,
} from 'h3'
import defu from 'defu'
import { useRuntimeConfig } from '#imports'
import type { CookieSerializeOptions } from 'cookie-es'
import {
  getEnv,
  getEnvs,
  getRedirectUri,
} from '../utils'
import { ofetch } from 'ofetch'
import type { RawAccessToken } from '../../../server'

export default defineEventHandler(async (event) => {
  try {
    const config  = useRuntimeConfig()
    const query   = getQuery(event)
    const profile = String(query.profile ?? config.public.defaultProfile ?? 'oauth')

    if (!config.nuauth?.profile.names.includes(profile)) {
      throw createError({
        status : 400,
        message: `Unknown oauth profile: ${profile}`,
      })
    }

    // eslint-disable-next-line array-element-newline, array-bracket-newline
    const host         = getEnvs(profile, ['REFRESH_HOST', 'TOKEN_HOST', 'HOST'])
    const path         = getEnvs(profile, ['REFRESH_PATH', 'TOKEN_PATH'], '/oauth/token')
    const clientId     = getEnv(profile, 'CLIENT_ID')
    const clientSecret = getEnv(profile, 'CLIENT_SECRET')
    const scope        = getEnv(profile, 'SCOPE', 'public read')
    const redirectUri  = getRedirectUri(profile, event)
    const code         = getCookie(event, `${profile}/refresh-token`)

    const form = new URLSearchParams()

    form.set('response_type', 'code')
    form.set('grant_type', 'refresh_token')
    form.set('client_id', clientId)
    form.set('client_secret', clientSecret)
    form.set('refresh_token', code as string)
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

    await event.context.nuauth?.callHook('token:refresh', {
      token,
      refreshToken,
      expires,
      _raw: rawToken,
    })

    return {
      code   : 200,
      message: 'Ok',
      data   : {
        token,
        refreshToken,
        expires,
      },
    }
  } catch (error) {
    await event.context.nuauth?.callHook('error', error)

    if (!event.handled) {
      const code    = (error as H3Error).statusCode ?? 500
      const message = (error as H3Error).message ?? 'Unknown rrror'

      setResponseStatus(event, code)

      return (error as H3Error).data ?? { code, message }
    }
  }
})
