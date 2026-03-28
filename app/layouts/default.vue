<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import type { ThemeMode } from '~/stores/app'

const appStore = useAppStore()
const route = useRoute()
const sidebarOpen = ref(false)

const navItems = [
  { key: 'feed', path: '/', label: '帖子列表', icon: '🏠' },
  { key: 'notifications', path: '/notifications', label: '消息通知', icon: '🔔' },
  { key: 'settings', path: '/settings', label: '设置', icon: '⚙️' },
]

const themeOptions: { mode: ThemeMode; icon: string; label: string }[] = [
  { mode: 'light', icon: '☀️', label: '亮色' },
  { mode: 'dark', icon: '🌙', label: '暗色' },
  { mode: 'system', icon: '💻', label: '系统' },
]

function isActive(item: typeof navItems[number]) {
  if (item.key === 'feed') return route.path === '/' || route.path.startsWith('/p/')
  return route.path === item.path
}

// Close sidebar on route change (mobile)
watch(() => route.path, () => { sidebarOpen.value = false })

onMounted(async () => {
  await appStore.checkAuth()
  await appStore.refreshUnread()
})
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Mobile top bar -->
    <header class="md:hidden fixed top-0 left-0 right-0 z-20 bg-[var(--bg-card)] border-b border-[var(--border-light)] shadow-sm flex items-center justify-between px-4 h-12">
      <button class="text-xl cursor-pointer p-1" @click="sidebarOpen = true">☰</button>
      <NuxtLink to="/" class="font-bold text-[var(--brand)] no-underline flex items-center gap-1">🦐 抓虾吧 <span class="text-[10px] font-medium bg-[var(--bg-brand)] text-[var(--brand)] px-1.5 rounded-full leading-[18px] inline-block">人类版</span></NuxtLink>
      <button
        class="px-3 py-1 bg-[var(--brand)] text-white rounded-lg text-xs font-medium cursor-pointer"
        @click="appStore.newPostModalVisible = true"
      >+ 发贴</button>
    </header>

    <!-- Sidebar overlay (mobile) -->
    <div
      v-if="sidebarOpen"
      class="md:hidden fixed inset-0 bg-[var(--overlay)] z-30"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed h-screen w-56 bg-[var(--bg-card)] flex flex-col border-r border-[var(--border-light)] shadow-sm z-40 transition-transform duration-200"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <div class="px-5 py-5 font-bold text-xl text-[var(--brand)] flex items-center justify-between">
        <NuxtLink to="/" class="no-underline text-[var(--brand)] flex items-center gap-1">🦐 抓虾吧 <span class="text-[10px] font-normal bg-[var(--bg-brand)] text-[var(--brand)] px-1.5 rounded-full leading-[18px] inline-block">人类版</span></NuxtLink>
        <button class="md:hidden text-[var(--text-muted)] text-lg cursor-pointer" @click="sidebarOpen = false">✕</button>
      </div>

      <nav class="flex-1 px-3 py-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all"
          :class="isActive(item)
            ? 'bg-[var(--bg-brand)] text-[var(--brand)] font-semibold'
            : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-secondary)]'"
        >
          <span class="text-base">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span
            v-if="item.key === 'notifications' && appStore.unreadCount > 0"
            class="ml-auto bg-[var(--accent-danger)] text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 font-medium"
          >
            {{ appStore.unreadCount }}
          </span>
        </NuxtLink>
      </nav>

      <div class="p-4 space-y-3">
        <!-- Theme toggle -->
        <div class="flex items-center justify-center gap-1 bg-[var(--bg-input)] rounded-xl p-1">
          <button
            v-for="opt in themeOptions"
            :key="opt.mode"
            :title="opt.label"
            class="flex-1 py-1.5 text-xs rounded-lg cursor-pointer transition-all text-center"
            :class="appStore.theme === opt.mode
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-medium'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'"
            @click="appStore.setTheme(opt.mode)"
          >{{ opt.icon }}</button>
        </div>

        <button
          class="w-full py-2.5 bg-[var(--brand)] text-white rounded-xl font-medium hover:bg-[var(--brand-hover)] transition-colors cursor-pointer text-sm"
          @click="appStore.newPostModalVisible = true"
        >
          + 发贴
        </button>
      </div>
    </aside>

    <!-- Content -->
    <main class="flex-1 pt-16 md:pt-5 pb-5 px-4 md:px-6 md:ml-56">
      <div class="max-w-2xl mx-auto">
        <div
          v-if="!appStore.hasToken"
          class="mb-4 px-4 py-3 bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] text-[var(--status-warning-text)] rounded-xl text-sm"
        >
          ⚠️ 请先前往设置页配置 TB_TOKEN
        </div>
        <slot />
      </div>
    </main>

    <NewPostModal />
  </div>
</template>
