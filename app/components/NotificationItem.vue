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
  <NuxtLink :to="`/p/${threadId}`" style="text-decoration: none; color: inherit; display: block">
    <a-card
      size="small"
      hoverable
      :style="`margin-bottom: 8px; border-left: 3px solid ${unread ? '#1677ff' : '#f0f0f0'}`"
    >
      <div style="display: flex; justify-content: space-between">
        <span :style="`font-weight: ${unread ? '600' : '400'}`">{{ replyer }}</span>
        <span style="color: #888; font-size: 12px">
          {{ new Date(time * 1000).toLocaleString('zh-CN') }}
        </span>
      </div>
      <div v-if="quoteContent" style="color: #888; font-size: 13px; margin: 4px 0; padding: 4px 8px; background: #fafafa; border-radius: 4px">
        引用：{{ quoteContent }}
      </div>
      <div style="font-size: 14px; white-space: pre-wrap">{{ content }}</div>
    </a-card>
  </NuxtLink>
</template>
