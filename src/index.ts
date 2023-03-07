import { withQuery, encodePath } from 'ufo'
import { type Ref } from 'vue-demi'
import {
  useCookie,
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
  token: Ref<string | null>,
  /**
   * Expired date
   */
  expires: Ref<string | null>,
  /**
   * Check token is almost expired
   * @param threshold {number} threshold before expired, default is 15 minutes
   */
  isAlmostExpired: (threshold?: number) => boolean,
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
  const token        = useCookie('session/token')
  const refreshToken = useCookie('session/refresh-token')
  const expires      = useCookie('session/expires')

  function isAlmostExpired (threshold = 15) {
    // Assume if has no expires, the token is already expired
    if (!expires.value)
      return true

    const end  = new Date(expires.value)
    const now  = new Date()
    const diff = Math.floor((end.getTime() - now.getTime()) / 60_000 /* millisecond in minute */)

    return diff > 0 && diff <= threshold
  }

  function login (path?: string): NavigateResult {
    const redirect = path ? encodePath(path) : undefined
    const url      = withQuery('/auth/login', { redirect })

    return navigateTo(url, { external: true })
  }

  function logout (path?: string): NavigateResult {
    const redirect = path ? encodePath(path) : undefined
    const url      = withQuery('/auth/logout', { redirect })

    return navigateTo(url, { external: true })
  }

  async function refresh (): Promise<string> {
    const response = await $fetch<AuthRefreshResponse>('/auth/refresh')

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
