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
      class="w-full px-3 py-2.5 bg-[#f7f8fa] border border-gray-200 rounded-xl text-[13px] text-[#333] focus:outline-none focus:border-[#4e6ef2] focus:bg-white resize-none transition-colors placeholder:text-[#bbb]"
    />
    <button
      :disabled="props.loading"
      class="mt-1.5 px-4 py-1.5 bg-[#4e6ef2] text-white rounded-lg text-[12px] font-medium hover:bg-[#3d5bd9] disabled:opacity-50 cursor-pointer transition-colors"
      @click="handleSubmit"
    >
      回复
    </button>
  </div>
</template>
