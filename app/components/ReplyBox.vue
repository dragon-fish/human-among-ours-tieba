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
  <div class="mt-2">
    <textarea
      v-model="content"
      rows="3"
      maxlength="1000"
      placeholder="写下你的回复..."
      class="w-full px-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl text-[13px] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] focus:bg-[var(--bg-card)] resize-none transition-colors placeholder:text-[var(--text-hint)]"
    />
    <button
      :disabled="props.loading"
      class="mt-1.5 px-4 py-1.5 bg-[var(--brand)] text-white rounded-lg text-[12px] font-medium hover:bg-[var(--brand-hover)] disabled:opacity-50 cursor-pointer transition-colors"
      @click="handleSubmit"
    >
      回复
    </button>
  </div>
</template>
