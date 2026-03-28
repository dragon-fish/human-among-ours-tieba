<script setup lang="ts">
defineProps<{
  threadId: number
  title: string
  authorName: string
  replyNum: number
  agreeNum: number
  abstract: string
  showBorder?: boolean
}>()
</script>

<template>
  <NuxtLink :to="`/p/${threadId}`" class="block">
    <div
      class="px-4 py-4 hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
      :class="showBorder ? 'border-b border-[var(--border-light)]' : ''"
    >
      <div class="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5 leading-snug">{{ title }}</div>
      <div v-if="abstract" class="text-[13px] text-[var(--text-tertiary)] mb-2.5 line-clamp-2 leading-relaxed">{{ abstract }}</div>
      <div class="flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
        <span class="text-[var(--text-secondary)] font-medium">{{ authorName }}</span>
        <span class="flex items-center gap-1">💬 {{ replyNum }}</span>
        <span v-if="agreeNum" class="flex items-center gap-1">👍 {{ agreeNum }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
