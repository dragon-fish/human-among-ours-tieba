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
  { immediate: appStore.hasToken },
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
    <button class="mb-3 flex items-center gap-1 text-sm text-[#999] hover:text-[#4e6ef2] cursor-pointer transition-colors" @click="$router.push('/')">
      ← 返回列表
    </button>

    <div v-if="error" class="mb-3 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
      {{ error.statusCode === 401 ? '请先前往设置页配置 TB_TOKEN' : error.message }}
    </div>

    <div v-if="pending" class="text-center py-12 text-[#999]">加载中...</div>

    <!-- First floor (OP) -->
    <div v-if="firstFloor" class="bg-white rounded-xl overflow-hidden mb-3">
      <div class="p-5">
        <h1 class="text-lg font-bold text-[#222] leading-snug mb-4">{{ firstFloor.title }}</h1>
        <div class="text-[15px] text-[#333] leading-relaxed whitespace-pre-wrap">{{ firstFloor.content?.[0]?.text ?? '' }}</div>
      </div>
      <!-- OP action bar -->
      <div class="flex items-center gap-6 px-5 py-3 border-t border-gray-100 text-[13px] text-[#999]">
        <button class="flex items-center gap-1.5 hover:text-[#4e6ef2] cursor-pointer transition-colors" @click="handleLike(firstFloor.id, Number(threadId), 3)">
          👍 <span>{{ firstFloor.agree?.agree_num ?? 0 }}</span>
        </button>
        <span class="flex items-center gap-1.5">💬 {{ replyCount }}</span>
      </div>
    </div>

    <!-- Replies section -->
    <div v-if="posts.length > 0 || !pending" class="bg-white rounded-xl overflow-hidden">
      <!-- Reply header -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <span class="text-sm font-semibold text-[#222]">全部回复</span>
        <div class="flex gap-3">
          <button
            v-for="opt in sortOpts"
            :key="opt.v"
            class="text-xs cursor-pointer transition-colors"
            :class="sort === opt.v ? 'text-[#4e6ef2] font-semibold' : 'text-[#999] hover:text-[#333]'"
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

      <div v-if="posts.length === 0 && !pending" class="py-8 text-center text-[13px] text-[#999]">暂无回复</div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPage > 1" class="mt-4 flex justify-center gap-2">
      <button :disabled="pn <= 1" class="px-4 py-2 text-sm bg-white rounded-lg border border-gray-200 disabled:opacity-40 cursor-pointer hover:bg-gray-50" @click="pn--">上一页</button>
      <span class="px-4 py-2 text-sm text-[#999]">{{ pn }} / {{ totalPage }}</span>
      <button :disabled="pn >= totalPage" class="px-4 py-2 text-sm bg-white rounded-lg border border-gray-200 disabled:opacity-40 cursor-pointer hover:bg-gray-50" @click="pn++">下一页</button>
    </div>
  </div>
</template>
