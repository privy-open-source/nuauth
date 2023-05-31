import { AuthorizationCode } from 'simple-oauth2'
import { getEnv } from './utils'

export function getClient (profile: string) {
  return new AuthorizationCode({
    client: {
      id    : getEnv(profile, 'CLIENT_ID'),
      secret: getEnv(profile, 'CLIENT_SECRET'),
    },
    auth   : { tokenHost: getEnv(profile, 'HOST') },
    options: { authorizationMethod: 'body' },
  })
}
