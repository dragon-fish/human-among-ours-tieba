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
      class="px-4 py-4 hover:bg-[#fafbfc] transition-colors border-b border-gray-100"
      :class="unread ? 'bg-[#f0f4ff]' : ''"
    >
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-[#e8ecff] flex items-center justify-center text-[10px] text-[#4e6ef2] font-bold">
            {{ replyer.charAt(0) }}
          </div>
          <span class="text-[13px] font-medium" :class="unread ? 'text-[#222]' : 'text-[#666]'">{{ replyer }}</span>
        </div>
        <span class="text-[11px] text-[#ccc]">{{ time ? new Date(time * 1000).toLocaleString('zh-CN') : '' }}</span>
      </div>
      <div v-if="quoteContent" class="ml-9 mb-1 text-[12px] text-[#999] bg-[#f7f8fa] rounded-lg px-3 py-2 leading-relaxed">
        引用：{{ quoteContent }}
      </div>
      <div class="ml-9 text-[13px] text-[#333] whitespace-pre-wrap leading-relaxed">{{ content }}</div>
    </div>
  </NuxtLink>
</template>
