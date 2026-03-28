<script setup lang="ts">
const props = defineProps<{
  postId: number
  threadId: number
  floor: number
  authorName: string
  content: string
  agreeNum: number
  subPosts: any[]
  isOp?: boolean
  showBorder?: boolean
}>()

const emit = defineEmits<{
  like: [postId: number, threadId: number, objType: number]
  reply: [postId: number, threadId: number, content: string]
  delete: [postId: number]
}>()

const showReply = ref(false)
const showSubFloors = ref(false)

const fetchedSubFloors = ref<any[] | null>(null)
const subPending = ref(false)

const subFloors = computed(() => fetchedSubFloors.value ?? props.subPosts ?? [])

async function toggleSubFloors() {
  if (!showSubFloors.value && !fetchedSubFloors.value) {
    subPending.value = true
    try {
      const res = await $fetch<any>(`/api/floor?post_id=${props.postId}&thread_id=${props.threadId}`)
      fetchedSubFloors.value = res.data?.post_list ?? []
    } catch { /* fall back */ }
    finally { subPending.value = false }
  }
  showSubFloors.value = !showSubFloors.value
}

function handleReply(content: string) {
  emit('reply', props.postId, props.threadId, content)
  showReply.value = false
}

function handleSubReply(postId: number, content: string) {
  emit('reply', postId, props.threadId, content)
}
</script>

<template>
  <div
    class="px-5 py-4"
    :class="showBorder ? 'border-b border-[var(--border-light)]' : ''"
  >
    <!-- Author row -->
    <div class="flex items-center gap-2 mb-2.5">
      <div class="w-8 h-8 rounded-full bg-[var(--bg-avatar)] flex items-center justify-center text-xs text-[var(--brand)] font-bold shrink-0">
        {{ authorName.charAt(0) }}
      </div>
      <div>
        <div class="text-[13px] font-medium text-[var(--text-secondary)]">{{ authorName }}</div>
      </div>
      <span class="ml-auto text-[11px] text-[var(--text-timestamp)]">{{ floor }}楼</span>
    </div>

    <!-- Content -->
    <div class="text-[14px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap mb-3 pl-10">{{ content }}</div>

    <!-- Action bar -->
    <div class="flex items-center gap-5 pl-10 text-[12px] text-[var(--text-muted)]">
      <button class="flex items-center gap-1 hover:text-[var(--brand)] cursor-pointer transition-colors" @click="emit('like', postId, threadId, isOp ? 3 : 1)">
        👍 {{ agreeNum }}
      </button>
      <button class="hover:text-[var(--brand)] cursor-pointer transition-colors" @click="showReply = !showReply">回复</button>
      <button class="hover:text-[var(--accent-danger)] cursor-pointer transition-colors" @click="emit('delete', postId)">删除</button>
    </div>

    <!-- Reply box -->
    <div v-if="showReply" class="pl-10 mt-2">
      <ReplyBox @submit="handleReply" />
    </div>

    <!-- Sub-floors (楼中楼) -->
    <div v-if="subPosts.length > 0" class="ml-10 mt-3 bg-[var(--bg-base)] rounded-xl overflow-hidden">
      <div v-if="!showSubFloors" class="px-4 py-2.5">
        <button class="text-[12px] text-[var(--brand)] hover:text-[var(--brand-hover)] cursor-pointer" @click="toggleSubFloors">
          查看 {{ subPosts.length }} 条回复 &gt;
        </button>
      </div>
      <div v-else>
        <SubFloorItem
          v-for="sub in subFloors"
          :key="sub.id"
          :post-id="sub.id"
          :thread-id="threadId"
          :author-name="sub.author?.name ?? ''"
          :content="sub.content?.[0]?.text ?? ''"
          :agree-num="sub.agree?.agree_num ?? 0"
          @like="(pid) => emit('like', pid, threadId, 2)"
          @reply="handleSubReply"
        />
        <div class="px-4 py-2">
          <button class="text-[12px] text-[var(--text-muted)] hover:text-[var(--brand)] cursor-pointer" @click="showSubFloors = false">收起</button>
        </div>
      </div>
      <div v-if="subPending" class="px-4 py-2 text-[12px] text-[var(--text-muted)]">加载中...</div>
    </div>
  </div>
</template>
