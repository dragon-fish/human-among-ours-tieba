<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const route = useRoute()

const navItems = [
  { key: 'feed', path: '/', label: '帖子列表', icon: '🏠' },
  { key: 'notifications', path: '/notifications', label: '消息通知', icon: '🔔' },
  { key: 'settings', path: '/settings', label: '设置', icon: '⚙️' },
]

function isActive(item: typeof navItems[number]) {
  if (item.key === 'feed') return route.path === '/' || route.path.startsWith('/p/')
  return route.path === item.path
}

onMounted(async () => {
  await appStore.checkAuth()
  await appStore.refreshUnread()
})
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="fixed h-screen w-56 bg-white flex flex-col border-r border-gray-100 shadow-sm z-10">
      <div class="px-5 py-5 font-bold text-xl text-[#4e6ef2]">
        🦐 抓虾吧
      </div>

      <nav class="flex-1 px-3 py-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all"
          :class="isActive(item)
            ? 'bg-[#eef1ff] text-[#4e6ef2] font-semibold'
            : 'text-[#666] hover:bg-gray-50 hover:text-[#333]'"
        >
          <span class="text-base">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span
            v-if="item.key === 'notifications' && appStore.unreadCount > 0"
            class="ml-auto bg-[#ff6046] text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 font-medium"
          >
            {{ appStore.unreadCount }}
          </span>
        </NuxtLink>
      </nav>

      <div class="p-4">
        <button
          class="w-full py-2.5 bg-[#4e6ef2] text-white rounded-xl font-medium hover:bg-[#3d5bd9] transition-colors cursor-pointer text-sm"
          @click="appStore.newPostModalVisible = true"
        >
          + 发贴
        </button>
      </div>
    </aside>

    <!-- Content -->
    <main class="ml-56 flex-1 py-5 px-6">
      <div class="max-w-2xl mx-auto">
        <div
          v-if="!appStore.hasToken"
          class="mb-4 px-4 py-3 bg-[#fff8e6] border border-[#ffe58f] text-[#ad6800] rounded-xl text-sm"
        >
          ⚠️ 请先前往设置页配置 TB_TOKEN
        </div>
        <slot />
      </div>
    </main>

    <NewPostModal />
  </div>
</template>
