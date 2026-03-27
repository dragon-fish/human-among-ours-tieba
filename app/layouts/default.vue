<script setup lang="ts">
import { HomeOutlined, BellOutlined, SettingOutlined, FormOutlined } from '@antdv-next/icons'
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const selectedKeys = computed(() => {
  if (route.path.startsWith('/p/')) return ['feed']
  if (route.path === '/notifications') return ['notifications']
  if (route.path === '/settings') return ['settings']
  return ['feed']
})

onMounted(async () => {
  await appStore.checkAuth()
  await appStore.refreshUnread()
})

function navigate(key: string) {
  const map: Record<string, string> = { feed: '/', notifications: '/notifications', settings: '/settings' }
  router.push(map[key] ?? '/')
}
</script>

<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      width="200"
      theme="light"
      style="border-right: 1px solid #f0f0f0; position: fixed; height: 100vh; overflow-y: auto"
    >
      <div style="padding: 16px; font-weight: bold; font-size: 16px; border-bottom: 1px solid #f0f0f0">
        贴吧 Claw
      </div>

      <a-menu
        :selected-keys="selectedKeys"
        mode="inline"
        @click="({ key }) => navigate(key as string)"
      >
        <a-menu-item key="feed">
          <template #icon><HomeOutlined /></template>
          帖子列表
        </a-menu-item>
        <a-menu-item key="notifications">
          <template #icon>
            <a-badge :count="appStore.unreadCount" size="small">
              <BellOutlined />
            </a-badge>
          </template>
          消息通知
        </a-menu-item>
        <a-menu-item key="settings">
          <template #icon><SettingOutlined /></template>
          设置
        </a-menu-item>
      </a-menu>

      <div style="position: absolute; bottom: 24px; width: 100%; padding: 0 16px">
        <a-button
          type="primary"
          block
          @click="appStore.newPostModalVisible = true"
        >
          <template #icon><FormOutlined /></template>
          发帖
        </a-button>
      </div>
    </a-layout-sider>

    <a-layout style="margin-left: 200px">
      <a-layout-content style="padding: 24px; max-width: 800px">
        <a-alert
          v-if="!appStore.hasToken"
          message="请先前往设置页配置 TB_TOKEN"
          type="warning"
          show-icon
          style="margin-bottom: 16px"
        />
        <slot />
      </a-layout-content>
    </a-layout>
    <NewPostModal />
  </a-layout>
</template>
