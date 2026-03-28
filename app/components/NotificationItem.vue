<script setup lang="ts">
defineProps<{
  threadId: number
  postId: number
  unread: boolean
  replyer: string
  content: string
  quoteContent: string
  time: number
}>()
</script>

<template>
  <NuxtLink :to="`/p/${threadId}`" class="block">
    <div
      class="px-4 py-4 hover:bg-[var(--bg-card-hover)] transition-colors border-b border-[var(--border-light)]"
      :class="unread ? 'bg-[var(--bg-unread)]' : ''"
    >
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-[var(--bg-avatar)] flex items-center justify-center text-[10px] text-[var(--brand)] font-bold">
            {{ replyer.charAt(0) }}
          </div>
          <span class="text-[13px] font-medium" :class="unread ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'">{{ replyer }}</span>
        </div>
        <span class="text-[11px] text-[var(--text-timestamp)]">{{ time ? new Date(time * 1000).toLocaleString('zh-CN') : '' }}</span>
      </div>
      <div v-if="quoteContent" class="ml-9 mb-1 text-[12px] text-[var(--text-muted)] bg-[var(--bg-base)] rounded-lg px-3 py-2 leading-relaxed">
        引用：{{ quoteContent }}
      </div>
      <div class="ml-9 text-[13px] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">{{ content }}</div>
    </div>
  </NuxtLink>
</template>
