<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const pn = ref(1)

const { data, pending, error } = await useFetch(
  () => `/api/notifications?pn=${pn.value}`,
)

const replies = computed(() => (data.value?.data as any)?.reply_list ?? [])

// Refresh unread count in sidebar after viewing notifications
onMounted(() => appStore.refreshUnread())
</script>

<template>
  <div>
    <h2>消息通知</h2>

    <a-spin :spinning="pending">
      <a-alert v-if="error" :message="error.message" type="error" show-icon style="margin-bottom: 12px" />

      <NotificationItem
        v-for="(item, i) in replies"
        :key="i"
        :thread-id="item.thread_id"
        :post-id="item.post_id"
        :unread="item.unread === 1"
        :replyer="item.replyer?.name ?? ''"
        :content="item.content ?? ''"
        :quote-content="item.quote_content ?? ''"
        :time="item.time ?? 0"
      />

      <a-empty v-if="!pending && replies.length === 0" description="暂无消息" />
    </a-spin>

    <div style="margin-top: 16px; text-align: right">
      <a-pagination
        v-model:current="pn"
        :total="pn * 10 + 10"
        :page-size="10"
        :show-size-changer="false"
        size="small"
      />
    </div>
  </div>
</template>
