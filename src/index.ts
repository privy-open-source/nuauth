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

// eslint-disable-next-line unicorn/no-array-reduce
const getKey = (s: string) => [...s].reduce((a, b) => Math.trunc(((a << 5) - a) + (b.codePointAt(0) ?? 0)), 0).toString(32)

export function useNuAuth (profile = 'oauth'): NuAuth {
  const event        = useRequestEvent()
  const token        = useState<string | undefined>(getKey(`${profile}/token`), () => event && getCookie(event, `${profile}/token`))
  const refreshToken = useState<string | undefined>(getKey(`${profile}/refresh-token`), () => event && getCookie(event, `${profile}/refresh-token`))
  const expires      = useState<string | undefined>(getKey(`${profile}/expires`), () => event && getCookie(event, `${profile}/expires`))

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
    const url      = withQuery('/auth/login', { redirect, profile })

    return navigateTo(joinURL(baseURL, url), { external: true })
  }

  function logout (path?: string): NavigateResult {
    const redirect = path ? encodePath(path) : undefined
    const url      = withQuery('/auth/logout', { redirect, profile })

    return navigateTo(joinURL(baseURL, url), { external: true })
  }

  async function refresh (): Promise<string> {
    const response = await $fetch<AuthRefreshResponse>('/auth/refresh', { query: { profile } })

    token.value        = response.data.access_token
    refreshToken.value = response.data.refresh_token
    expires.value      = response.data.expires

    return response.data.access_token
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
