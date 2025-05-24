import type { NitroAppPlugin } from 'nitropack'
import { Hookable } from 'hookable'
import { setHeader } from 'h3'
import type { NuAuthContext, NuAuthHook } from '../../../server'

class NuAuthCtx extends Hookable<NuAuthHook> implements NuAuthContext {}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default <NitroAppPlugin> function (nitroApp) {
  nitroApp.hooks.hook('request', (event) => {
    event.context.nuauth = new NuAuthCtx()
  })

  nitroApp.hooks.hook('beforeResponse', (event) => {
    setHeader(event, 'cache-control', 'no-cache, no-store, must-revalidate')
    setHeader(event, 'pragma', 'no-cache')
    setHeader(event, 'expires', '0')
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    event.context.nuauth?.removeAllHooks()
  })
}
