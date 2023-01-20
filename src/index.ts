import { withQuery, encodePath } from 'ufo'
import { sendRedirect } from 'h3'
import {
  computed,
  ComputedRef,
  Ref,
} from 'vue-demi'
import { useCookie, useRequestEvent } from '#imports'

interface AuthRefreshResponse {
  code: number,
  message: string,
  data: {
    access_token: string,
    refresh_token: string,
    expires: string,
  },
}

export interface NuAuth {
  token: Ref<string | null>,
  expires: Ref<string | null>,
  isAlmostExpired: ComputedRef<boolean>,

  login: (redirect?: string) => Promise<void>,
  logout: (redirect?: string) => Promise<void>,
  refresh: () => Promise<string>,
}

export function useNuAuth (): NuAuth {
  const token        = useCookie('session/token')
  const refreshToken = useCookie('session/refresh-token')
  const expires      = useCookie('session/expires')
  const event        = useRequestEvent()

  const isAlmostExpired = computed(() => {
    if (!expires.value)
      return false

    const end  = new Date(expires.value)
    const now  = new Date()
    const diff = Math.floor((end.getTime() - now.getTime()) / 60_000 /* millisecond in minute */)

    return diff > 0 && diff <= 15
  })

  async function login (path?: string): Promise<void> {
    const redirect = path ? encodePath(path) : undefined
    const url      = withQuery('/auth/login', { redirect })

    if (process.server)
      await sendRedirect(event, url)
    else
      window.location.href = url
  }

  async function logout (path?: string): Promise<void> {
    const redirect = path ? encodePath(path) : undefined
    const url      = withQuery('/auth/logout', { redirect })

    if (process.server)
      await sendRedirect(event, url)
    else
      window.location.href = url
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
