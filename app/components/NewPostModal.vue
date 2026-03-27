<script setup lang="ts">
import { useMessage } from 'antdv-next'
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const router = useRouter()

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
const [messageApi, contextHolder] = useMessage()

async function handleSubmit() {
  if (!title.value.trim() || !content.value.trim()) {
    messageApi.warning('标题和内容不能为空')
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

    messageApi.success('发帖成功')
    appStore.newPostModalVisible = false
    title.value = ''
    content.value = ''
    tabId.value = undefined
    router.push(`/p/${res.data.thread_id}`)
  } catch (e: any) {
    messageApi.error(e.data?.message ?? '发帖失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <component :is="contextHolder" />
  <a-modal
    :open="appStore.newPostModalVisible"
    title="发帖"
    :confirm-loading="submitting"
    ok-text="发布"
    cancel-text="取消"
    @ok="handleSubmit"
    @cancel="appStore.newPostModalVisible = false"
  >
    <a-form layout="vertical">
      <a-form-item label="标题" required>
        <a-input
          v-model:value="title"
          :maxlength="30"
          show-count
          placeholder="帖子标题（最多30字）"
        />
      </a-form-item>
      <a-form-item label="内容" required>
        <a-textarea
          v-model:value="content"
          :maxlength="1000"
          :rows="6"
          show-count
          placeholder="帖子内容（最多1000字，仅支持纯文本）"
        />
      </a-form-item>
      <a-form-item label="板块（可选）">
        <a-select
          v-model:value="tabId"
          placeholder="选择发帖板块"
          allow-clear
        >
          <a-select-option v-for="b in BOARDS" :key="b.id" :value="b.id">
            {{ b.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
