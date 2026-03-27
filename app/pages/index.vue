<script setup lang="ts">
const sortType = ref('0')
const pn = ref(1)

const { data, pending, error, refresh } = await useFetch(
  () => `/api/feed?sort_type=${sortType.value}&pn=${pn.value}`,
)

const threads = computed(() => data.value?.data?.thread_list ?? [])
const totalPage = computed(() => data.value?.data?.page?.total_page ?? 1)

watch([sortType], () => { pn.value = 1 })
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2 style="margin: 0">帖子列表</h2>
      <a-radio-group v-model:value="sortType" button-style="solid" size="small">
        <a-radio-button value="0">最新</a-radio-button>
        <a-radio-button value="3">热门</a-radio-button>
      </a-radio-group>
    </div>

    <a-spin :spinning="pending">
      <a-alert v-if="error" :message="error.message" type="error" show-icon style="margin-bottom: 12px" />

      <PostCard
        v-for="thread in threads"
        :key="thread.thread_id"
        :thread-id="thread.thread_id"
        :title="thread.title"
        :author-name="thread.author?.name ?? ''"
        :reply-num="thread.reply_num ?? 0"
        :last-time="thread.last_time_int ?? 0"
      />

      <a-empty v-if="!pending && threads.length === 0" description="暂无帖子" />
    </a-spin>

    <div style="margin-top: 16px; text-align: right">
      <a-pagination
        v-model:current="pn"
        :total="totalPage * 10"
        :page-size="10"
        :show-size-changer="false"
        size="small"
      />
    </div>
  </div>
</template>
