<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const toast = useToast()
const route = useRoute()
const threadId = computed(() => route.params.id as string)
const pn = ref(1)
const sort = ref('0')

const { data, pending, error, refresh } = await useFetch(
  () => `/api/post/${threadId.value}?pn=${pn.value}&r=${sort.value}`,
)

const firstFloor = computed(() => (data.value as any)?.first_floor ?? null)
const posts = computed(() => (data.value as any)?.post_list ?? [])
const totalPage = computed(() => (data.value as any)?.page?.total_page ?? 1)
const replyCount = computed(() => posts.value.length)

const sortOpts = [
  { v: '0', l: '正序' },
  { v: '1', l: '倒序' },
  { v: '2', l: '热门' },
]

async function handleLike(postId: number, tid: number, objType: number) {
  try {
    await $fetch('/api/agree', {
      method: 'POST',
      body: { thread_id: Number(tid), post_id: postId, obj_type: objType, op_type: 0 },
    })
    toast.success('点赞成功')
  } catch (e: any) {
    toast.error(e.data?.message ?? '点赞失败')
  }
}

async function handleReply(postId: number, tid: number, content: string) {
  if (!content) return
  try {
    await $fetch('/api/reply', {
      method: 'POST',
      body: { content, post_id: postId, thread_id: Number(tid) },
    })
    toast.success('回复成功')
    refresh()
  } catch (e: any) {
    toast.error(e.data?.message ?? '回复失败')
  }
}

async function handleDelete(postId: number) {
  if (!confirm('确认删除？')) return
  try {
    await $fetch('/api/delete', {
      method: 'POST',
      body: { type: 'post', post_id: postId },
    })
    toast.success('删除成功')
    refresh()
  } catch (e: any) {
    toast.error(e.data?.message ?? '删除失败')
  }
}
</script>

<template>
  <div>
    <!-- Back button -->
    <button class="mb-3 flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--brand)] cursor-pointer transition-colors" @click="$router.push('/')">
      ← 返回列表
    </button>

    <div v-if="error" class="mb-3 px-4 py-3 bg-[var(--status-error-bg)] border border-[var(--status-error-border)] text-[var(--status-error-text)] rounded-xl text-sm">
      {{ error.statusCode === 401 ? '请先前往设置页配置 TB_TOKEN' : error.message }}
    </div>

    <div v-if="pending" class="text-center py-12 text-[var(--text-muted)]">加载中...</div>

    <!-- First floor (OP) -->
    <div v-if="firstFloor" class="bg-[var(--bg-card)] rounded-xl overflow-hidden mb-3">
      <div class="p-5">
        <h1 class="text-lg font-bold text-[var(--text-primary)] leading-snug mb-3">{{ firstFloor.title }}</h1>
        <div v-if="firstFloor.author?.name" class="text-[13px] text-[var(--text-muted)] mb-3">{{ firstFloor.author.name }}</div>
        <div class="text-[15px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{{ firstFloor.content?.[0]?.text ?? '' }}</div>
      </div>
      <!-- OP action bar -->
      <div class="flex items-center gap-6 px-5 py-3 border-t border-[var(--border-light)] text-[13px] text-[var(--text-muted)]">
        <button class="flex items-center gap-1.5 hover:text-[var(--brand)] cursor-pointer transition-colors" @click="handleLike(firstFloor.id, Number(threadId), 3)">
          👍 <span>{{ firstFloor.agree?.agree_num ?? 0 }}</span>
        </button>
        <span class="flex items-center gap-1.5">💬 {{ replyCount }}</span>
      </div>
    </div>

    <!-- Replies section -->
    <div v-if="posts.length > 0 || !pending" class="bg-[var(--bg-card)] rounded-xl overflow-hidden">
      <!-- Reply header -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-[var(--border-light)]">
        <span class="text-sm font-semibold text-[var(--text-primary)]">全部回复</span>
        <div class="flex gap-3">
          <button
            v-for="opt in sortOpts"
            :key="opt.v"
            class="text-xs cursor-pointer transition-colors"
            :class="sort === opt.v ? 'text-[var(--brand)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'"
            @click="sort = opt.v"
          >{{ opt.l }}</button>
        </div>
      </div>

      <!-- Floor list -->
      <FloorItem
        v-for="(post, idx) in posts"
        :key="post.id"
        :post-id="post.id"
        :thread-id="Number(threadId)"
        :floor="post.floor ?? ((pn - 1) * 30 + idx + 1)"
        :author-name="post.author?.name ?? ''"
        :content="post.content?.[0]?.text ?? ''"
        :agree-num="post.agree?.agree_num ?? 0"
        :sub-posts="post.sub_post_list?.sub_post_list ?? []"
        :is-op="(pn === 1 && idx === 0)"
        :show-border="idx < posts.length - 1"
        @like="handleLike"
        @reply="handleReply"
        @delete="handleDelete"
      />

      <div v-if="posts.length === 0 && !pending" class="py-8 text-center text-[13px] text-[var(--text-muted)]">暂无回复</div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPage > 1" class="mt-4 flex justify-center gap-2">
      <button :disabled="pn <= 1" class="px-4 py-2 text-sm bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] disabled:opacity-40 cursor-pointer hover:bg-[var(--bg-card-hover)]" @click="pn--">上一页</button>
      <span class="px-4 py-2 text-sm text-[var(--text-muted)]">{{ pn }} / {{ totalPage }}</span>
      <button :disabled="pn >= totalPage" class="px-4 py-2 text-sm bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] disabled:opacity-40 cursor-pointer hover:bg-[var(--bg-card-hover)]" @click="pn++">下一页</button>
    </div>
  </div>
</template>
