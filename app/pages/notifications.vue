<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const pn = ref(1)

const { data, pending, error } = await useFetch(
  () => `/api/notifications?pn=${pn.value}`,
)

const replies = computed(() => (data.value?.data as any)?.reply_list ?? [])

onMounted(() => appStore.refreshUnread())
</script>

<template>
  <div>
    <h2 class="text-lg font-bold text-[var(--text-primary)] mb-4">消息通知</h2>

    <div v-if="error" class="mb-3 px-4 py-3 bg-[var(--status-error-bg)] border border-[var(--status-error-border)] text-[var(--status-error-text)] rounded-xl text-sm">
      {{ error.statusCode === 401 ? '请先前往设置页配置 TB_TOKEN' : error.message }}
    </div>

    <div v-if="pending" class="text-center py-12 text-[var(--text-muted)]">加载中...</div>

    <div v-if="replies.length > 0" class="bg-[var(--bg-card)] rounded-xl overflow-hidden">
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
    </div>

    <div v-if="!pending && replies.length === 0" class="text-center py-12 text-[var(--text-muted)]">暂无消息</div>

    <div class="mt-4 flex justify-center gap-2">
      <button :disabled="pn <= 1" class="px-4 py-2 text-sm bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] disabled:opacity-40 cursor-pointer hover:bg-[var(--bg-card-hover)]" @click="pn--">上一页</button>
      <span class="px-4 py-2 text-sm text-[var(--text-muted)]">第 {{ pn }} 页</span>
      <button class="px-4 py-2 text-sm bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] cursor-pointer hover:bg-[var(--bg-card-hover)]" @click="pn++">下一页</button>
    </div>
  </div>
</template>
