const toasts = ref<{ id: number; message: string; type: 'success' | 'error' | 'warning' }[]>([])
let nextId = 0

export function useToast() {
  function show(message: string, type: 'success' | 'error' | 'warning' = 'success', duration = 3000) {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }

  return {
    toasts: readonly(toasts),
    success: (msg: string) => show(msg, 'success'),
    error: (msg: string) => show(msg, 'error'),
    warning: (msg: string) => show(msg, 'warning'),
  }
}
