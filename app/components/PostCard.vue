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
      class="px-4 py-4 hover:bg-[#fafbfc] transition-colors cursor-pointer"
      :class="showBorder ? 'border-b border-gray-100' : ''"
    >
      <div class="text-[15px] font-semibold text-[#222] mb-1.5 leading-snug">{{ title }}</div>
      <div v-if="abstract" class="text-[13px] text-[#666] mb-2.5 line-clamp-2 leading-relaxed">{{ abstract }}</div>
      <div class="flex items-center gap-4 text-[12px] text-[#999]">
        <span class="text-[#333] font-medium">{{ authorName }}</span>
        <span class="flex items-center gap-1">💬 {{ replyNum }}</span>
        <span v-if="agreeNum" class="flex items-center gap-1">👍 {{ agreeNum }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
