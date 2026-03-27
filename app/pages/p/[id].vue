<script setup lang="ts">
import { useMessage } from 'antdv-next'

const [messageApi, contextHolder] = useMessage()

const route = useRoute()
const threadId = computed(() => route.params.id as string)
const pn = ref(1)
const sort = ref('0')

const { data, pending, error, refresh } = await useFetch(
  () => `/api/post/${threadId.value}?pn=${pn.value}&r=${sort.value}`,
)

const thread = computed(() => (data.value as any)?.data?.thread ?? null)
const posts = computed(() => (data.value as any)?.data?.post_list ?? [])
const totalPage = computed(() => (data.value as any)?.data?.page?.total_page ?? 1)

async function handleLike(postId: number, tid: number, objType: number) {
  try {
    await $fetch('/api/agree', {
      method: 'POST',
      body: { thread_id: Number(tid), post_id: postId, obj_type: objType, op_type: 0 },
    })
    messageApi.success('点赞成功')
  } catch (e: any) {
    messageApi.error(e.data?.message ?? '点赞失败')
  }
}

async function handleReply(postId: number, tid: number, content: string) {
  if (!content) return
  try {
    const res = await $fetch<{ data: { thread_id: number; post_id: number } }>('/api/reply', {
      method: 'POST',
      body: { content, post_id: postId, thread_id: Number(tid) },
    })
    messageApi.success(`回复成功 → /p/${res.data.thread_id}?pid=${res.data.post_id}`)
    refresh()
  } catch (e: any) {
    messageApi.error(e.data?.message ?? '回复失败')
  }
}

async function handleDelete(postId: number, tid: number) {
  try {
    await $fetch('/api/delete', {
      method: 'POST',
      body: { type: 'post', post_id: postId, thread_id: Number(tid) },
    })
    messageApi.success('删除成功')
    refresh()
  } catch (e: any) {
    messageApi.error(e.data?.message ?? '删除失败')
  }
}
</script>

<template>
  <div>
    <component :is="contextHolder" />
    <a-spin :spinning="pending">
      <a-alert v-if="error" :message="error.message" type="error" show-icon style="margin-bottom: 12px" />

      <div v-if="thread" style="margin-bottom: 16px">
        <h2>{{ thread.title }}</h2>
        <div style="display: flex; gap: 12px; align-items: center">
          <a-radio-group v-model:value="sort" button-style="solid" size="small">
            <a-radio-button value="0">正序</a-radio-button>
            <a-radio-button value="1">倒序</a-radio-button>
            <a-radio-button value="2">热门</a-radio-button>
          </a-radio-group>
        </div>
      </div>

      <FloorItem
        v-for="post in posts"
        :key="post.post_id"
        :post-id="post.post_id"
        :thread-id="Number(threadId)"
        :floor="post.floor ?? 0"
        :author-name="post.author?.name ?? ''"
        :content="post.content?.[0]?.text ?? ''"
        :agree-num="post.agree?.agree_num ?? 0"
        :sub-post-count="post.sub_post_number ?? 0"
        :is-op="post.floor === 1"
        @like="handleLike"
        @reply="handleReply"
        @delete="handleDelete"
      />
    </a-spin>

    <div style="margin-top: 16px; text-align: right">
      <a-pagination
        v-model:current="pn"
        :total="totalPage * 30"
        :page-size="30"
        :show-size-changer="false"
        size="small"
      />
    </div>
  </div>
</template>
