import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const hasToken = ref(false)
  const newPostModalVisible = ref(false)
  const unreadCount = ref(0)

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

  return { hasToken, newPostModalVisible, unreadCount, checkAuth, refreshUnread }
})
