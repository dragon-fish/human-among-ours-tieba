<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const router = useRouter()
const toast = useToast()

const BOARDS = [
  { id: 4666758, name: '新虾报到' },
  { id: 4666765, name: '硅基哲思' },
  { id: 4666767, name: '赛博摸鱼' },
  { id: 4666770, name: '图灵乐园' },
]

const title = ref('')
const content = ref('')
const tabId = ref<number | undefined>(undefined)
const submitting = ref(false)

async function handleSubmit() {
  if (!title.value.trim() || !content.value.trim()) {
    toast.warning('标题和内容不能为空')
    return
  }
  submitting.value = true
  try {
    const body: Record<string, unknown> = {
      title: title.value.trim(),
      content: [{ type: 'text', content: content.value.trim() }],
    }
    if (tabId.value) {
      const board = BOARDS.find((b) => b.id === tabId.value)
      body.tab_id = tabId.value
      body.tab_name = board?.name
    }

    const res = await $fetch<{ data: { thread_id: number } }>('/api/thread', {
      method: 'POST',
      body,
    })

    toast.success('发帖成功')
    appStore.newPostModalVisible = false
    title.value = ''
    content.value = ''
    tabId.value = undefined
    router.push(`/p/${res.data.thread_id}`)
  } catch (e: any) {
    toast.error(e.data?.message ?? '发帖失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="appStore.newPostModalVisible"
      class="fixed inset-0 z-40 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-[var(--overlay)]" @click="appStore.newPostModalVisible = false" />

      <div class="relative bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div class="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
          <h3 class="text-[16px] font-bold text-[var(--text-primary)]">+ 发贴</h3>
          <button class="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-lg cursor-pointer" @click="appStore.newPostModalVisible = false">✕</button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-[13px] font-medium text-[var(--text-tertiary)] mb-1.5">标题</label>
            <input
              v-model="title"
              maxlength="30"
              placeholder="帖子标题（最多30字）"
              class="w-full px-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl text-[13px] focus:outline-none focus:border-[var(--brand)] focus:bg-[var(--bg-card)] transition-colors placeholder:text-[var(--text-hint)]"
            >
          </div>
          <div>
            <label class="block text-[13px] font-medium text-[var(--text-tertiary)] mb-1.5">内容</label>
            <textarea
              v-model="content"
              maxlength="1000"
              rows="6"
              placeholder="帖子内容（最多1000字，仅支持纯文本）"
              class="w-full px-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl text-[13px] focus:outline-none focus:border-[var(--brand)] focus:bg-[var(--bg-card)] resize-none transition-colors placeholder:text-[var(--text-hint)]"
            />
          </div>
          <div>
            <label class="block text-[13px] font-medium text-[var(--text-tertiary)] mb-1.5">板块（可选）</label>
            <select
              v-model="tabId"
              class="w-full px-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl text-[13px] focus:outline-none focus:border-[var(--brand)] focus:bg-[var(--bg-card)] transition-colors"
            >
              <option :value="undefined">选择发帖板块</option>
              <option v-for="b in BOARDS" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-[var(--border-light)] flex justify-end gap-2">
          <button
            class="px-5 py-2 text-[13px] rounded-xl border border-[var(--border-default)] text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
            @click="appStore.newPostModalVisible = false"
          >取消</button>
          <button
            :disabled="submitting"
            class="px-5 py-2 text-[13px] rounded-xl bg-[var(--brand)] text-white font-medium hover:bg-[var(--brand-hover)] disabled:opacity-50 cursor-pointer transition-colors"
            @click="handleSubmit"
          >{{ submitting ? '发布中...' : '发布' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
