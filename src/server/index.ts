import type { H3Event } from 'h3'
import type {
  Hookable,
  HookCallback,
  HookKeys,
} from 'hookable'
import type { FetchContext } from 'ofetch'

export interface RawAccessToken {
  token_type: 'Bearer',
  access_token: string,
  refresh_token: string,
  expires_in: number,
  scope: string,
}

export interface AccessToken {
  token: string,
  refreshToken: string,
  expires: Date,
  _raw: RawAccessToken,
}

export interface NuAuthHook {
  /**
   * Event before send request authorize token
   */
  'request:token': (ctx: FetchContext<RawAccessToken, 'json'>) => void | Promise<void>,
  /**
   * Event when successfully request token
   */
  'token': (token: AccessToken) => void | Promise<void>,
  /**
   * Event when successfully refresh token
   */
  'token:refresh': (token: AccessToken) => void | Promise<void>,
  /**
   * Event when got error
   */
  'error': (error: Error) => void | Promise<void>,
}

export interface NuAuthContext extends Hookable<NuAuthHook> {

}

declare module 'h3' {
  interface H3EventContext {
    nuauth?: NuAuthContext,
  }
}

type InferCallback<HT, HN extends keyof HT> = HT[HN] extends HookCallback ? HT[HN] : never

export function onNuAuth<Name extends HookKeys<NuAuthHook>> (event: H3Event, name: Name, handler: InferCallback<NuAuthHook, Name>) {
  event.context.nuauth?.hook(name, handler)
}
