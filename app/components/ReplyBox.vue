<script setup lang="ts">
const props = defineProps<{ loading?: boolean }>()
const emit = defineEmits<{ submit: [content: string] }>()

const content = ref('')

function handleSubmit() {
  if (!content.value.trim()) return
  emit('submit', content.value.trim())
  content.value = ''
}
</script>

<template>
  <div style="margin-top: 8px">
    <a-textarea
      v-model:value="content"
      :rows="3"
      :maxlength="1000"
      placeholder="写下你的回复..."
      show-count
    />
    <a-button
      type="primary"
      size="small"
      :loading="props.loading"
      style="margin-top: 8px"
      @click="handleSubmit"
    >
      回复
    </a-button>
  </div>
</template>
