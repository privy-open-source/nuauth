import {
  defineEventHandler,
  getCookie,
  createError,
} from 'h3'
import { AuthorizationCode } from 'simple-oauth2'

export default defineEventHandler(async (event) => {
  try {
    const client = new AuthorizationCode({
      client: {
        id    : `${import.meta.env.OAUTH_CLIENT_ID}`,
        secret: `${import.meta.env.OAUTH_CLIENT_SECRET}`,
      },
      auth   : { tokenHost: `${import.meta.env.OAUTH_HOST}` },
      options: { authorizationMethod: 'body' },
    })

    const access = await client.createToken({
      access_token : getCookie(event, 'session/token'),
      refresh_token: getCookie(event, 'session/refresh-token'),
      expires_at   : getCookie(event, 'session/expired'),
    }).refresh()

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
