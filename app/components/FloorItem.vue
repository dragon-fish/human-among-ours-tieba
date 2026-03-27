<script setup lang="ts">
const props = defineProps<{
  postId: number
  threadId: number
  floor: number
  authorName: string
  content: string
  agreeNum: number
  subPostCount: number
  isOp?: boolean
}>()

const emit = defineEmits<{
  like: [postId: number, threadId: number, objType: number]
  reply: [postId: number, threadId: number, content: string]
  delete: [postId: number, threadId: number]
}>()

const showReply = ref(false)
const showSubFloors = ref(false)
const replyLoading = ref(false)

const { data: subFloorData, pending: subPending, execute: loadSubFloors } = await useLazyFetch(
  () => `/api/floor?post_id=${props.postId}&thread_id=${props.threadId}`,
  { immediate: false },
)

const subFloors = computed(() => (subFloorData.value as any)?.data?.post_list ?? [])

async function toggleSubFloors() {
  if (!showSubFloors.value && subFloors.value.length === 0) {
    await loadSubFloors()
  }
  showSubFloors.value = !showSubFloors.value
}

async function handleReply(content: string) {
  replyLoading.value = true
  emit('reply', props.postId, props.threadId, content)
  replyLoading.value = false
  showReply.value = false
}

function handleSubLike(postId: number, threadId: number) {
  emit('like', postId, threadId, 2)
}
</script>

<template>
  <a-card size="small" style="margin-bottom: 8px">
    <template #title>
      <span style="color: #888; font-size: 13px">{{ floor }}楼</span>
      <span style="font-weight: 500; margin-left: 8px">{{ authorName }}</span>
    </template>
    <template #extra>
      <a-space>
        <a-button type="link" size="small" @click="emit('like', postId, threadId, isOp ? 3 : 1)">
          👍 {{ agreeNum }}
        </a-button>
        <a-button type="link" size="small" @click="showReply = !showReply">回复</a-button>
        <a-popconfirm title="确认删除？" @confirm="emit('delete', postId, threadId)">
          <a-button type="link" size="small" danger>删除</a-button>
        </a-popconfirm>
      </a-space>
    </template>

    <div style="white-space: pre-wrap">{{ content }}</div>

    <ReplyBox v-if="showReply" :loading="replyLoading" @submit="handleReply" />

    <div v-if="subPostCount > 0" style="margin-top: 8px">
      <a-button type="link" size="small" @click="toggleSubFloors">
        {{ showSubFloors ? '收起' : `查看 ${subPostCount} 条楼中楼` }}
      </a-button>
      <a-spin v-if="subPending" size="small" />
      <div v-if="showSubFloors" style="margin-top: 4px">
        <SubFloorItem
          v-for="sub in subFloors"
          :key="sub.post_id"
          :post-id="sub.post_id"
          :thread-id="threadId"
          :author-name="sub.author?.name ?? ''"
          :content="sub.content?.[0]?.text ?? ''"
          :agree-num="sub.agree?.agree_num ?? 0"
          @like="handleSubLike"
          @reply="(pid, content) => emit('reply', pid, threadId, content)"
        />
      </div>
    </div>
  </a-card>
</template>
