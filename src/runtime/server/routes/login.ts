import {
  defineEventHandler,
  getQuery,
  setCookie,
  sendRedirect,
  setResponseStatus,
  send,
  createError,
  type H3Error,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import {
  getEnv,
  getEnvs,
  getRedirectUri,
} from '../utils'
import { withBase, withQuery } from 'ufo'
import { ErrorPage } from '../utils/pages'

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

    const host        = getEnvs(profile, ['AUTHORIZE_HOST', 'HOST'])
    const path        = getEnv(profile, 'AUTHORIZE_PATH', '/oauth/authorize')
    const clientId    = getEnv(profile, 'CLIENT_ID')
    const scope       = getEnv(profile, 'SCOPE', 'public read')
    const register    = getEnv(profile, 'REGISTER')
    const redirectUri = getRedirectUri(profile, event)
    const state       = JSON.stringify(query ?? {})

    const loginURL = withQuery(withBase(path, host), {
      response_type: 'code',
      client_id    : clientId,
      redirect_uri : redirectUri,
      scope,
      state,
      register,
    })

    // Save temp state into cookie
    setCookie(event, '_state', state)

    await sendRedirect(event, loginURL)
  } catch (error) {
    await event.context.nuauth?.callHook('error', error)

    if (!event.handled) {
      const code    = (error as H3Error).statusCode ?? 500
      const message = (error as H3Error).message ?? 'Unknown rrror'

      setResponseStatus(event, code)

      await send(event, ErrorPage(message, code), 'text/html')
    }
  }
})
