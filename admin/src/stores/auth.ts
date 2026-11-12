import axios from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface AdminUser {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  token: string
  expired_at: string
}

interface LoginResponse {
  status: boolean
  message: string
  data?: {
    user?: AdminUser
  }
}

const STORAGE_KEY = 'snapshare-admin-auth'

function isExpired(expiredAt: string): boolean {
  const time = new Date(expiredAt).getTime()
  return Number.isNaN(time) || time <= Date.now()
}

function toAdminUser(value: Partial<AdminUser>): AdminUser | null {
  if (
    typeof value.id !== 'number' ||
    typeof value.first_name !== 'string' ||
    typeof value.last_name !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.role !== 'string' ||
    typeof value.token !== 'string' ||
    typeof value.expired_at !== 'string'
  ) {
    return null
  }

  return {
    id: value.id,
    first_name: value.first_name,
    last_name: value.last_name,
    email: value.email,
    role: value.role,
    token: value.token,
    expired_at: value.expired_at,
  }
}

function readStoredUser(): AdminUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = toAdminUser(JSON.parse(raw) as Partial<AdminUser>)
    if (!parsed || parsed.role !== 'admin' || isExpired(parsed.expired_at)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(readStoredUser())

  const isAdmin = computed(() => {
    const current = user.value
    return !!current && current.role === 'admin' && !isExpired(current.expired_at)
  })

  async function client() {
    return (await import('../api/client')).default
  }

  async function applyAuthHeader(token: string | null) {
    const api = await client()
    const common = api.defaults.headers.common as Record<string, unknown>
    if (token) {
      common.Authorization = `Bearer ${token}`
      return
    }
    delete common.Authorization
  }

  if (user.value) {
    void applyAuthHeader(user.value.token)
  }

  async function login(email: string, password: string) {
    const api = await client()

    let response: LoginResponse
    try {
      const result = await api.post<LoginResponse>('/auth/login', { email, password })
      response = result.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string } | undefined)?.message
        throw new Error(typeof message === 'string' && message ? message : 'Login failed.')
      }
      throw new Error('Login failed.')
    }

    const next = response.data?.user ? toAdminUser(response.data.user) : null
    if (!response.status || !next) {
      throw new Error(response.message || 'Login failed.')
    }

    if (next.role !== 'admin') {
      user.value = null
      localStorage.removeItem(STORAGE_KEY)
      await applyAuthHeader(null)
      throw new Error('This account is not allowed to use the admin app.')
    }

    if (isExpired(next.expired_at)) {
      user.value = null
      localStorage.removeItem(STORAGE_KEY)
      await applyAuthHeader(null)
      throw new Error('This session has expired.')
    }

    user.value = next
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    await applyAuthHeader(next.token)
  }

  async function logout() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
    await applyAuthHeader(null)
  }

  return { user, isAdmin, login, logout }
})
