/* global $fetch */
import {
  withQuery,
  encodePath,
  joinURL,
} from 'ufo'
import getURL from 'requrl'
import { getCookie } from 'h3'
import type { Ref } from 'vue-demi'
import {
  useState,
  useRequestEvent,
  useRuntimeConfig,
  navigateTo,
} from '#imports'

interface AuthRefreshResponse {
  code: number,
  message: string,
  data: {
    access_token: string,
    refresh_token: string,
    expires: string,
  },
}

type NavigateResult = ReturnType<typeof navigateTo>

export interface NuAuth {
  /**
   * Access token
   */
  token: Ref<string | null | undefined>,
  /**
   * Expired date
   */
  expires: Ref<string | null | undefined>,
  /**
   * Check token is almost expired
   * @param minutes {number} threshold before expired, default is 15 minutes
   */
  isAlmostExpired: (minutes?: number) => boolean,
  /**
   * Redirect to Login Page
   * @param path Redirect path after login success
   */
  login: (redirect?: string) => NavigateResult,
  /**
   * Redirect to Logout Page
   * @param path Redirect path after re-login success
   */
  logout: (redirect?: string) => NavigateResult,
  /**
   * Request new access-token
   * @returns new access-token
   */
  refresh: () => Promise<string>,
}

export function useNuAuth (): NuAuth {
  const token        = useState<string | undefined>()
  const refreshToken = useState<string | undefined>()
  const expires      = useState<string | undefined>()

  const event   = useRequestEvent()
  const config  = useRuntimeConfig()
  const host    = getURL(event?.node?.req)
  const baseURL = joinURL(host, config.app.baseURL)

  function isAlmostExpired (minutes = 15) {
    // Assume if has no expires, the token is already expired
    if (!expires.value)
      return true

    const end  = new Date(expires.value)
    const now  = new Date()
    const diff = Math.floor((end.getTime() - now.getTime()) / 60_000 /* millisecond in minute */)

    return diff > 0 && diff <= minutes
  }

  function login (path?: string): NavigateResult {
    const redirect = path ? encodePath(path) : undefined
    const url      = withQuery('/auth/login', { redirect })

    return navigateTo(joinURL(baseURL, url), { external: true })
  }

  function logout (path?: string): NavigateResult {
    const redirect = path ? encodePath(path) : undefined
    const url      = withQuery('/auth/logout', { redirect })

    return navigateTo(joinURL(baseURL, url), { external: true })
  }

  async function refresh (): Promise<string> {
    const response = await $fetch<AuthRefreshResponse>('/auth/refresh')

    token.value        = response.data.access_token
    refreshToken.value = response.data.refresh_token
    expires.value      = response.data.expires

    return response.data.access_token
  }

  if (process.server) {
    token.value        = getCookie(event, 'session/token')
    refreshToken.value = getCookie(event, 'session/refresh-token')
    expires.value      = getCookie(event, 'session/expires')
  }

  return {
    token,
    expires,
    isAlmostExpired,
    login,
    logout,
    refresh,
  }
}
