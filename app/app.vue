<template>
  <div class="bg-[var(--bg-base)] min-h-screen text-[var(--text-primary)] transition-colors duration-200">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
  </div>
</template>

<style>
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; }

:root {
  /* Backgrounds */
  --bg-base: #f7f8fa;
  --bg-card: #ffffff;
  --bg-card-hover: #fafbfc;
  --bg-input: #f7f8fa;
  --bg-brand: #eef1ff;
  --bg-avatar: #e8ecff;
  --bg-unread: #f0f4ff;
  --bg-sub-floor: #f7f8fa;

  /* Text */
  --text-primary: #222;
  --text-secondary: #333;
  --text-tertiary: #666;
  --text-muted: #999;
  --text-hint: #bbb;
  --text-timestamp: #ccc;

  /* Brand */
  --brand: #4e6ef2;
  --brand-hover: #3d5bd9;
  --accent-danger: #ff6046;

  /* Borders */
  --border-light: #f3f4f6;
  --border-default: #e5e7eb;

  /* Status */
  --status-success-bg: #f0faf0;
  --status-success-border: #b7eb8f;
  --status-success-text: #389e0d;
  --status-warning-bg: #fff8e6;
  --status-warning-border: #ffe58f;
  --status-warning-text: #ad6800;
  --status-error-bg: #fef2f2;
  --status-error-border: #fecaca;
  --status-error-text: #dc2626;

  /* Overlay */
  --overlay: rgba(0, 0, 0, 0.4);
}

.dark {
  --bg-base: #0f0f0f;
  --bg-card: #1a1a1a;
  --bg-card-hover: #222;
  --bg-input: #222;
  --bg-brand: #1e2a4a;
  --bg-avatar: #2a3a5c;
  --bg-unread: #1e2a4a;
  --bg-sub-floor: #222;

  --text-primary: #e8e8e8;
  --text-secondary: #d0d0d0;
  --text-tertiary: #a0a0a0;
  --text-muted: #707070;
  --text-hint: #555;
  --text-timestamp: #4a4a4a;

  --brand: #6b8aff;
  --brand-hover: #5a78ee;
  --accent-danger: #ff7b6b;

  --border-light: #2a2a2a;
  --border-default: #333;

  --status-success-bg: #0a2a0a;
  --status-success-border: #2a5a2a;
  --status-success-text: #6bcf6b;
  --status-warning-bg: #2a2000;
  --status-warning-border: #5a4a00;
  --status-warning-text: #e8c040;
  --status-error-bg: #2a0a0a;
  --status-error-border: #5a2a2a;
  --status-error-text: #ff6b6b;

  --overlay: rgba(0, 0, 0, 0.6);
}
</style>
