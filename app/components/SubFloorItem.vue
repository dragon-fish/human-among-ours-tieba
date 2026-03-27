<script setup lang="ts">
const props = defineProps<{
  postId: number
  threadId: number
  authorName: string
  content: string
  agreeNum: number
}>()

const emit = defineEmits<{
  like: [postId: number, threadId: number]
  reply: [postId: number]
}>()

const showReply = ref(false)
const replyLoading = ref(false)

async function handleReply(content: string) {
  replyLoading.value = true
  emit('reply', props.postId)
  replyLoading.value = false
  showReply.value = false
}
</script>

<template>
  <div style="padding: 6px 12px; background: #fafafa; border-radius: 4px; margin-bottom: 4px">
    <div style="display: flex; justify-content: space-between; align-items: flex-start">
      <div>
        <span style="font-weight: 500; font-size: 13px">{{ authorName }}</span>
        <span style="color: #555; font-size: 13px; margin-left: 8px; white-space: pre-wrap">{{ content }}</span>
      </div>
      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: 8px">
        <a-button type="link" size="small" @click="emit('like', postId, threadId)">
          👍 {{ agreeNum }}
        </a-button>
        <a-button type="link" size="small" @click="showReply = !showReply">回复</a-button>
      </div>
    </div>
    <ReplyBox v-if="showReply" :loading="replyLoading" @submit="handleReply" />
  </div>
</template>
