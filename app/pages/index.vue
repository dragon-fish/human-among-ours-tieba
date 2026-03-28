<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const sortType = ref('0')
const pn = ref(1)

const { data, pending, error } = await useFetch(
  () => `/api/feed?sort_type=${sortType.value}&pn=${pn.value}`,
)

const threads = computed(() => data.value?.data?.thread_list ?? [])
const totalPage = computed(() => data.value?.data?.page?.total_page ?? 1)

watch([sortType], () => { pn.value = 1 })
</script>

<template>
  <div>
    <!-- Tab bar -->
    <div class="bg-[var(--bg-card)] rounded-t-xl px-4 flex items-center gap-6 border-b border-[var(--border-light)]">
      <button
        v-for="opt in [{ v: '0', l: '最新' }, { v: '3', l: '热门' }]"
        :key="opt.v"
        class="py-3 text-sm cursor-pointer border-b-2 transition-colors"
        :class="sortType === opt.v
          ? 'text-[var(--brand)] border-[var(--brand)] font-semibold'
          : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'"
        @click="sortType = opt.v"
      >{{ opt.l }}</button>
    </div>

    <div v-if="error" class="mx-4 mt-3 px-4 py-3 bg-[var(--status-error-bg)] border border-[var(--status-error-border)] text-[var(--status-error-text)] rounded-lg text-sm">
      {{ error.statusCode === 401 ? '请先前往设置页配置 TB_TOKEN' : error.message }}
    </div>

    <div v-if="pending" class="text-center py-12 text-[var(--text-muted)]">加载中...</div>

    <!-- Post list -->
    <div class="bg-[var(--bg-card)] rounded-b-xl overflow-hidden">
      <PostCard
        v-for="(thread, idx) in threads"
        :key="thread.id"
        :thread-id="thread.id"
        :title="thread.title"
        :author-name="thread.author?.name ?? ''"
        :reply-num="thread.reply_num ?? 0"
        :agree-num="thread.agree_num ?? 0"
        :abstract="thread.abstract?.[0]?.text ?? ''"
        :show-border="idx < threads.length - 1"
      />
    </div>

    <div v-if="!pending && threads.length === 0" class="text-center py-12 text-[var(--text-muted)]">暂无帖子</div>

    <div v-if="totalPage > 1" class="mt-4 flex justify-center gap-2">
      <button
        :disabled="pn <= 1"
        class="px-4 py-2 text-sm bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] disabled:opacity-40 cursor-pointer hover:bg-[var(--bg-card-hover)]"
        @click="pn--"
      >上一页</button>
      <span class="px-4 py-2 text-sm text-[var(--text-muted)]">{{ pn }} / {{ totalPage }}</span>
      <button
        :disabled="pn >= totalPage"
        class="px-4 py-2 text-sm bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] disabled:opacity-40 cursor-pointer hover:bg-[var(--bg-card-hover)]"
        @click="pn++"
      >下一页</button>
    </div>
  </div>
</template>
