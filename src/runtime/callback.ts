import {
  defineEventHandler,
  getQuery,
  setCookie,
  send,
  setResponseStatus,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import defu from 'defu'
import destr from 'destr'
import type { CookieSerializeOptions } from 'cookie-es'
import {
  getEnv,
  getHomeURL,
  getRedirectUri,
} from '../core/utils'
import { getClient } from '../core/client'

export default defineEventHandler(async (event) => {
  try {
    const config  = useRuntimeConfig()
    const query   = getQuery(event)
    const state   = destr(query.state) ?? {}
    const profile = String(state.profile ?? config.public.defaultProfile ?? 'oauth')

    if (!config.nuauth?.profile.names.includes(profile))
      throw new Error(`Unknown oauth profile: ${profile}`)

    const client  = getClient(profile)
    const homeURL = getHomeURL(profile, state.redirect)
    const access  = await client.getToken({
      code        : query.code as string,
      redirect_uri: getRedirectUri(event, profile),
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
      setCookie(event, `${profile}/enterprise-token`, state.enteprise)

    // Use meta refresh as redirection to fix issue with cookies samesite=strict
    // See: https://stackoverflow.com/questions/42216700/how-can-i-redirect-after-oauth2-with-samesite-strict-and-still-get-my-cookies
    await send(event,
      `<html>
        <head>
          <meta http-equiv="refresh" content="0;URL='${homeURL}'"/>
        </head>
        <body>
          <h1>Redirection</h1>
          <p>Moved to <a href="${homeURL}">${homeURL}</a>.</p>
        </body>
      </html>
      `, 'text/html')
  } catch (error) {
    setResponseStatus(event, 500)

    return {
      code   : 500,
      message: (error as Error).message,
    }
  }
})
