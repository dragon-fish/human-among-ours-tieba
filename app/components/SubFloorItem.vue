<script setup lang="ts">
const props = defineProps<{
  postId: number
  threadId: number
  authorName: string
  content: string
  agreeNum: number
}>()

const emit = defineEmits<{
  like: [postId: number]
  reply: [postId: number, content: string]
}>()

const showReply = ref(false)

function handleReply(content: string) {
  emit('reply', props.postId, content)
  showReply.value = false
}
</script>

<template>
  <div class="px-4 py-3 border-b border-[var(--border-light)] last:border-b-0">
    <div class="flex items-start gap-2">
      <div class="w-6 h-6 rounded-full bg-[var(--bg-avatar)] flex items-center justify-center text-[10px] text-[var(--brand)] font-bold shrink-0 mt-0.5">
        {{ authorName.charAt(0) }}
      </div>
      <div class="flex-1 min-w-0">
        <span class="text-[12px] font-medium text-[var(--brand)]">{{ authorName }}</span>
        <div class="text-[13px] text-[var(--text-secondary)] mt-0.5 whitespace-pre-wrap leading-relaxed">{{ content }}</div>
        <div class="flex items-center gap-4 mt-1.5 text-[11px] text-[var(--text-muted)]">
          <button class="flex items-center gap-1 hover:text-[var(--brand)] cursor-pointer transition-colors" @click="emit('like', postId)">👍 {{ agreeNum }}</button>
          <button class="hover:text-[var(--brand)] cursor-pointer transition-colors" @click="showReply = !showReply">回复</button>
        </div>
        <ReplyBox v-if="showReply" @submit="handleReply" />
      </div>
    </div>
  </div>
</template>
