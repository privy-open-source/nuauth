import {
  defineEventHandler,
  getQuery,
  sendRedirect,
  createError,
} from 'h3'
import { AuthorizationCode } from 'simple-oauth2'
import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  try {
    const query  = getQuery(event)
    const client = new AuthorizationCode({
      client: {
        id    : `${import.meta.env.OAUTH_CLIENT_ID}`,
        secret: `${import.meta.env.OAUTH_CLIENT_SECRET}`,
      },
      auth   : { tokenHost: `${import.meta.env.OAUTH_HOST}` },
      options: { authorizationMethod: 'body' },
    })

    const scope = import.meta.env.OAUTH_SCOPE
      ? `${import.meta.env.OAUTH_SCOPE}`
      : 'public read'

    const state = query
      ? JSON.stringify(query)
      : '{}'

    const authorizeURL = client.authorizeURL({
      redirect_uri: `${import.meta.env.OAUTH_REDIRECT_URI}`,
      state,
      scope,
    })

    const register = `${import.meta.env.OAUTH_REGISTER}`
    const loginURL = withQuery(authorizeURL, { register })

    await sendRedirect(event, loginURL)
  } catch (error) {
    return createError({
      statusCode: 500,
      message   : (error as Error).message,
    })
  }
})
