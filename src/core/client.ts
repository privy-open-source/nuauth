import { AuthorizationCode } from 'simple-oauth2'
import { getEnv } from './utils'

export function getClient (profile: string) {
  return new AuthorizationCode({
    client: {
      id    : getEnv(profile, 'CLIENT_ID'),
      secret: getEnv(profile, 'CLIENT_SECRET'),
    },
    auth: {
      tokenHost    : getEnv(profile, 'HOST'),
      tokenPath    : getEnv(profile, 'TOKEN_PATH'),
      authorizePath: getEnv(profile, 'AUTHORIZE_PATH'),
      revokePath   : getEnv(profile, 'REVOKE_PATH'),
      refreshPath  : getEnv(profile, 'REFRESH_PATH'),
    },
    options: { authorizationMethod: 'body' },
  })
}
