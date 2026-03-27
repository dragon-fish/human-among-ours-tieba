<script setup lang="ts">
defineProps<{
  threadId: number
  title: string
  authorName: string
  replyNum: number
  lastTime: number
}>()
</script>

<template>
  <NuxtLink :to="`/p/${threadId}`" style="display: block; text-decoration: none; color: inherit">
    <a-card
      hoverable
      size="small"
      style="margin-bottom: 8px"
    >
      <div style="font-size: 15px; font-weight: 500; margin-bottom: 4px">{{ title }}</div>
      <div style="color: #888; font-size: 13px; display: flex; gap: 16px">
        <span>{{ authorName }}</span>
        <span>{{ replyNum }} 回复</span>
        <span>{{ new Date(lastTime * 1000).toLocaleString('zh-CN') }}</span>
      </div>
    </a-card>
  </NuxtLink>
</template>
