import {
  defineEventHandler,
  getQuery,
  setCookie,
  sendRedirect,
  createError,
} from 'h3'
import { AuthorizationCode, AuthorizationMethod } from 'simple-oauth2'
import { parseURL, decodePath } from 'ufo'

function getHomeURL (redirect?: string): string {
  try {
    if (redirect) {
      const whitelist = `${import.meta.env.OAUTH_REDIRECT_WHITELIST || ''}`.split(';')
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

  return `${import.meta.env.OAUTH_HOME || '/'}`
}

export default defineEventHandler(async (event) => {
  try {
    const query  = getQuery(event)
    const client = new AuthorizationCode({
      client: {
        id    : `${import.meta.env.OAUTH_CLIENT_ID}`,
        secret: `${import.meta.env.OAUTH_CLIENT_SECRET}`,
      },
      auth   : { tokenHost: `${import.meta.env.OAUTH_HOST}` },
      options: { authorizationMethod: AuthorizationMethod.BODY },
    })

    const scope = import.meta.env.OAUTH_SCOPE
      ? `${import.meta.env.OAUTH_SCOPE}`
      : 'public read'

    const state: Record<string, string> = query.state && !Array.isArray(query.state)
      ? JSON.parse(query.state)
      : {}

    const homeURL = getHomeURL(state.redirect)
    const access  = await client.getToken({
      code        : `${query.code as string}`,
      redirect_uri: `${import.meta.env.OAUTH_REDIRECT_URI}`,
      scope,
    })

    setCookie(event, 'session/token', access.token.access_token as string)
    setCookie(event, 'session/refresh-token', access.token.refresh_token as string)
    setCookie(event, 'session/expires', access.token.expires_at as string)

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
