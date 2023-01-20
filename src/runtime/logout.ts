import {
  defineEventHandler,
  getQuery,
  sendRedirect,
  deleteCookie,
} from 'h3'
import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const scope = import.meta.env.OAUTH_SCOPE
    ? `${import.meta.env.OAUTH_SCOPE}`
    : 'public read'

  const state = query
    ? JSON.stringify(query)
    : '{}'

  const logoutUrl = withQuery(`${import.meta.env.OAUTH_LOGOUT_URI}`, {
    response_type: 'code',
    client_id    : `${import.meta.env.OAUTH_CLIENT_ID}`,
    redirect_uri : `${import.meta.env.OAUTH_REDIRECT_URI}`,
    state,
    scope,
  })

  deleteCookie(event, 'session/token')
  deleteCookie(event, 'session/refresh-token')
  deleteCookie(event, 'session/expires')

  await sendRedirect(event, logoutUrl)
})
