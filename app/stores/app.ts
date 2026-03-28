import { defineStore } from 'pinia'
import { usePreferredDark } from '@vueuse/core'

export type ThemeMode = 'system' | 'light' | 'dark'

export const useAppStore = defineStore('app', () => {
  const hasToken = ref(false)
  const newPostModalVisible = ref(false)
  const unreadCount = ref(0)

  // Theme
  const theme = ref<ThemeMode>(
    (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') as ThemeMode : null) ?? 'system',
  )
  const prefersDark = usePreferredDark()

  const isDark = computed(() => {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    return prefersDark.value
  })

  function setTheme(mode: ThemeMode) {
    theme.value = mode
    localStorage.setItem('theme', mode)
  }

  // Apply .dark class to <html>
  watch(isDark, (dark) => {
    document.documentElement.classList.toggle('dark', dark)
  }, { immediate: true })

  async function checkAuth() {
    try {
      const data = await $fetch<{ authenticated: boolean }>('/api/auth/status')
      hasToken.value = data.authenticated
    } catch {
      hasToken.value = false
    }
  }

  async function refreshUnread() {
    if (!hasToken.value) return
    try {
      const data = await $fetch<{ data: { reply_list: { unread: number }[] } }>('/api/notifications?pn=1')
      unreadCount.value = data.data?.reply_list?.filter((r) => r.unread === 1).length ?? 0
    } catch {
      unreadCount.value = 0
    }
  }

  return { hasToken, newPostModalVisible, unreadCount, theme, isDark, setTheme, checkAuth, refreshUnread }
})
