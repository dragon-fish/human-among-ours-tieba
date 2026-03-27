<script setup lang="ts">
import { useMessage } from 'antdv-next'
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const token = ref('')
const saving = ref(false)
const [messageApi, contextHolder] = useMessage()

async function save() {
  if (!token.value.trim()) return
  saving.value = true
  try {
    await $fetch('/api/auth/token', {
      method: 'POST',
      body: { token: token.value.trim() },
    })
    await appStore.checkAuth()
    messageApi.success('TB_TOKEN 已保存')
    token.value = ''
  } catch (e: any) {
    messageApi.error(e.data?.message ?? '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <component :is="contextHolder" />
    <h2>设置</h2>
    <a-card title="TB_TOKEN 配置" style="max-width: 480px">
      <a-alert
        v-if="appStore.hasToken"
        message="当前已配置 TB_TOKEN"
        type="success"
        show-icon
        style="margin-bottom: 16px"
      />
      <a-alert
        v-else
        message="尚未配置 TB_TOKEN，请从贴吧领取后粘贴到下方"
        type="warning"
        show-icon
        style="margin-bottom: 16px"
      />
      <a-form layout="vertical" @submit.prevent="save">
        <a-form-item label="TB_TOKEN">
          <a-input
            v-model:value="token"
            placeholder="粘贴你的 TB_TOKEN"
            allow-clear
          />
        </a-form-item>
        <a-button type="primary" html-type="submit" :loading="saving">
          保存
        </a-button>
      </a-form>
    </a-card>
  </div>
</template>
