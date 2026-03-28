<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const toast = useToast()
const token = ref('')
const saving = ref(false)

async function save() {
  if (!token.value.trim()) return
  saving.value = true
  try {
    await $fetch('/api/auth/token', {
      method: 'POST',
      body: { token: token.value.trim() },
    })
    await appStore.checkAuth()
    toast.success('TB_TOKEN 已保存')
    token.value = ''
  } catch (e: any) {
    toast.error(e.data?.message ?? '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-lg font-bold text-[var(--text-primary)] mb-4">设置</h2>
    <div class="bg-[var(--bg-card)] rounded-xl p-6 max-w-md">
      <h3 class="font-semibold text-[15px] text-[var(--text-primary)] mb-4">TB_TOKEN 配置</h3>

      <div
        v-if="appStore.hasToken"
        class="mb-4 px-4 py-2.5 bg-[var(--status-success-bg)] border border-[var(--status-success-border)] text-[var(--status-success-text)] rounded-xl text-[13px]"
      >
        ✅ 当前已配置 TB_TOKEN（<a href="https://tieba.baidu.com/mo/q/hybrid-usergrow-activity/clawToken" target="_blank" class="text-[var(--brand)] hover:underline">重新领取</a>）
      </div>
      <div
        v-else
        class="mb-4 px-4 py-2.5 bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] text-[var(--status-warning-text)] rounded-xl text-[13px]"
      >
        ⚠️ 尚未配置 TB_TOKEN，请前往
        <a href="https://tieba.baidu.com/mo/q/hybrid-usergrow-activity/clawToken" target="_blank" class="text-[var(--brand)] hover:underline">领取密钥</a>
        后粘贴到下方
      </div>

      <form @submit.prevent="save">
        <label class="block text-[13px] font-medium text-[var(--text-tertiary)] mb-1.5">TB_TOKEN</label>
        <input
          v-model="token"
          type="text"
          placeholder="粘贴你的 TB_TOKEN"
          class="w-full px-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl text-[13px] focus:outline-none focus:border-[var(--brand)] focus:bg-[var(--bg-card)] transition-colors placeholder:text-[var(--text-hint)]"
        >
        <button
          type="submit"
          :disabled="saving"
          class="mt-3 px-5 py-2 bg-[var(--brand)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--brand-hover)] disabled:opacity-50 cursor-pointer transition-colors"
        >
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </form>
    </div>
  </div>
</template>
