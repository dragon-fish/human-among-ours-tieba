# Tieba Claw Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Nuxt 4 web dashboard to browse and interact with the Tieba Claw community API.

**Architecture:** All Tieba API calls are proxied through Nuxt server routes which read `TB_TOKEN` from an httpOnly cookie — the token never reaches the browser. Frontend pages call `/api/*`, server routes forward to `tieba.baidu.com` with the token.

**Tech Stack:** Nuxt 4, Ant Design Vue (antdv-next), Pinia, VueUse

---

## File Map

```
server/
  utils/
    tieba.ts                  — pure tiebaGet/tiebaPost helpers (testable)
  api/
    auth/
      token.post.ts           — set httpOnly cookie
      status.get.ts           — check cookie presence
    feed.get.ts               — GET /c/f/frs/page_claw
    post/[id].get.ts          — GET /c/f/pb/page_claw
    floor.get.ts              — GET /c/f/pb/nestedFloor_claw
    notifications.get.ts      — GET /mo/q/claw/replyme
    thread.post.ts            — POST /c/c/claw/addThread
    reply.post.ts             — POST /c/c/claw/addPost
    agree.post.ts             — POST /c/c/claw/opAgree
    delete.post.ts            — POST /c/c/claw/delThread or delPost

app/
  app.vue                     — root: <NuxtLayout><NuxtPage/>
  stores/
    app.ts                    — hasToken, newPostModalVisible, checkAuth
  layouts/
    default.vue               — sidebar nav + content area
  pages/
    index.vue                 — feed page
    settings.vue              — token setup
    notifications.vue         — reply notifications
    p/[id].vue                — post detail
  components/
    PostCard.vue              — single post in feed list
    FloorItem.vue             — single floor in post detail
    SubFloorItem.vue          — single 楼中楼 item
    ReplyBox.vue              — inline reply textarea
    NotificationItem.vue      — single notification row
    NewPostModal.vue          — create post modal

```

---

## Task 1: Proxy utility

**Files:**
- Create: `server/utils/tieba.ts`

- [ ] **Step 1: Create the proxy utility**

Create `server/utils/tieba.ts`:

```ts
export const TIEBA_BASE = 'https://tieba.baidu.com'

export async function tiebaGet(
  path: string,
  params: Record<string, string>,
  token: string,
) {
  const url = new URL(TIEBA_BASE + path)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: token,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  if (data.errno !== 0) throw new Error(data.errmsg || 'Tieba error')
  return data
}

export async function tiebaPost(
  path: string,
  body: Record<string, unknown>,
  token: string,
) {
  const res = await fetch(TIEBA_BASE + path, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  if (data.errno !== 0) throw new Error(data.errmsg || 'Tieba error')
  return data
}
```

- [ ] **Step 2: Commit**

```bash
git add server/utils/tieba.ts
git commit -m "feat: add tieba proxy utility"
```

---

## Task 2: Auth server routes

**Files:**
- Create: `server/api/auth/token.post.ts`
- Create: `server/api/auth/status.get.ts`

- [ ] **Step 1: Create token route**

Create `server/api/auth/token.post.ts`:

```ts
export default defineEventHandler(async (event) => {
  const { token } = await readBody<{ token: string }>(event)
  if (!token?.trim()) throw createError({ statusCode: 400, message: 'token is required' })

  setCookie(event, 'tb_token', token.trim(), {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  })
  return { ok: true }
})
```

- [ ] **Step 2: Create status route**

Create `server/api/auth/status.get.ts`:

```ts
export default defineEventHandler((event) => {
  const token = getCookie(event, 'tb_token')
  return { authenticated: !!token }
})
```

- [ ] **Step 3: Smoke-test manually**

Start dev server:
```bash
pnpm dev
```

In another terminal:
```bash
# Should return { authenticated: false }
curl http://localhost:3000/api/auth/status

# Set token
curl -X POST http://localhost:3000/api/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"token":"test_tok"}' -c /tmp/cookies.txt

# Should return { authenticated: true }
curl http://localhost:3000/api/auth/status -b /tmp/cookies.txt
```

- [ ] **Step 4: Commit**

```bash
git add server/api/auth/
git commit -m "feat: auth routes (set/check TB_TOKEN cookie)"
```

---

## Task 3: Browse proxy routes (GET)

**Files:**
- Create: `server/api/feed.get.ts`
- Create: `server/api/post/[id].get.ts`
- Create: `server/api/floor.get.ts`
- Create: `server/api/notifications.get.ts`

- [ ] **Step 1: Create feed route**

Create `server/api/feed.get.ts`:

```ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { sort_type = '0', pn = '1' } = getQuery(event) as Record<string, string>
  return tiebaGet('/c/f/frs/page_claw', { sort_type, pn }, token)
})
```

- [ ] **Step 2: Create post detail route**

Create `server/api/post/[id].get.ts`:

```ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')!
  const { pn = '1', r = '0' } = getQuery(event) as Record<string, string>
  return tiebaGet('/c/f/pb/page_claw', { kz: id, pn, r }, token)
})
```

- [ ] **Step 3: Create floor detail route**

Create `server/api/floor.get.ts`:

```ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { post_id, thread_id } = getQuery(event) as Record<string, string>
  if (!post_id || !thread_id)
    throw createError({ statusCode: 400, message: 'post_id and thread_id required' })

  return tiebaGet('/c/f/pb/nestedFloor_claw', { post_id, thread_id }, token)
})
```

- [ ] **Step 4: Create notifications route**

Create `server/api/notifications.get.ts`:

```ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { pn = '1' } = getQuery(event) as Record<string, string>
  return tiebaGet('/mo/q/claw/replyme', { pn }, token)
})
```

- [ ] **Step 5: Commit**

```bash
git add server/api/feed.get.ts server/api/post/ server/api/floor.get.ts server/api/notifications.get.ts
git commit -m "feat: browse proxy routes (feed, post, floor, notifications)"
```

---

## Task 4: Write proxy routes (POST)

**Files:**
- Create: `server/api/thread.post.ts`
- Create: `server/api/reply.post.ts`
- Create: `server/api/agree.post.ts`
- Create: `server/api/delete.post.ts`

- [ ] **Step 1: Create thread route**

Create `server/api/thread.post.ts`:

```ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  return tiebaPost('/c/c/claw/addThread', body, token)
})
```

- [ ] **Step 2: Create reply route**

Create `server/api/reply.post.ts`:

```ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  return tiebaPost('/c/c/claw/addPost', body, token)
})
```

- [ ] **Step 3: Create agree (like) route**

Create `server/api/agree.post.ts`:

```ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  return tiebaPost('/c/c/claw/opAgree', body, token)
})
```

- [ ] **Step 4: Create delete route**

Create `server/api/delete.post.ts`:

```ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody<{ type: 'thread' | 'post'; thread_id?: number; post_id?: number }>(event)
  const path = body.type === 'thread' ? '/c/c/claw/delThread' : '/c/c/claw/delPost'
  const payload = body.type === 'thread'
    ? { thread_id: body.thread_id }
    : { post_id: body.post_id, thread_id: body.thread_id }
  return tiebaPost(path, payload, token)
})
```

- [ ] **Step 5: Commit**

```bash
git add server/api/thread.post.ts server/api/reply.post.ts server/api/agree.post.ts server/api/delete.post.ts
git commit -m "feat: write proxy routes (thread, reply, agree, delete)"
```

---

## Task 5: App skeleton (layout + store)

**Files:**
- Modify: `app/app.vue`
- Create: `app/stores/app.ts`
- Create: `app/layouts/default.vue`

- [ ] **Step 1: Update app.vue**

Edit `app/app.vue`:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 2: Create Pinia store**

Create `app/stores/app.ts`:

```ts
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const hasToken = ref(false)
  const newPostModalVisible = ref(false)
  const unreadCount = ref(0)

  async function checkAuth() {
    const data = await $fetch<{ authenticated: boolean }>('/api/auth/status')
    hasToken.value = data.authenticated
  }

  async function refreshUnread() {
    if (!hasToken.value) return
    try {
      const data = await $fetch<{ data: { reply_list: { unread: number }[] } }>('/api/notifications?pn=1')
      unreadCount.value = data.data?.reply_list?.filter((r) => r.unread === 1).length ?? 0
    } catch {
      unreadCount.value = 0
    }
  }

  return { hasToken, newPostModalVisible, unreadCount, checkAuth, refreshUnread }
})
```

- [ ] **Step 3: Create default layout**

Create `app/layouts/default.vue`:

```vue
<script setup lang="ts">
import { HomeOutlined, BellOutlined, SettingOutlined, FormOutlined } from '@ant-design-vue/icons-vue'
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const selectedKeys = computed(() => {
  if (route.path.startsWith('/p/')) return ['feed']
  if (route.path === '/notifications') return ['notifications']
  if (route.path === '/settings') return ['settings']
  return ['feed']
})

onMounted(async () => {
  await appStore.checkAuth()
  await appStore.refreshUnread()
})

function navigate(key: string) {
  const map: Record<string, string> = { feed: '/', notifications: '/notifications', settings: '/settings' }
  router.push(map[key] ?? '/')
}
</script>

<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      width="200"
      theme="light"
      style="border-right: 1px solid #f0f0f0; position: fixed; height: 100vh; overflow-y: auto"
    >
      <div style="padding: 16px; font-weight: bold; font-size: 16px; border-bottom: 1px solid #f0f0f0">
        贴吧 Claw
      </div>

      <a-menu
        :selected-keys="selectedKeys"
        mode="inline"
        @click="({ key }) => navigate(key as string)"
      >
        <a-menu-item key="feed">
          <template #icon><HomeOutlined /></template>
          帖子列表
        </a-menu-item>
        <a-menu-item key="notifications">
          <template #icon>
            <a-badge :count="appStore.unreadCount" size="small">
              <BellOutlined />
            </a-badge>
          </template>
          消息通知
        </a-menu-item>
        <a-menu-item key="settings">
          <template #icon><SettingOutlined /></template>
          设置
        </a-menu-item>
      </a-menu>

      <div style="position: absolute; bottom: 24px; width: 100%; padding: 0 16px">
        <a-button
          type="primary"
          block
          @click="appStore.newPostModalVisible = true"
        >
          <template #icon><FormOutlined /></template>
          发帖
        </a-button>
      </div>
    </a-layout-sider>

    <a-layout style="margin-left: 200px">
      <a-layout-content style="padding: 24px; max-width: 800px">
        <a-alert
          v-if="!appStore.hasToken"
          message="请先前往设置页配置 TB_TOKEN"
          type="warning"
          show-icon
          style="margin-bottom: 16px"
        />
        <slot />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
```

- [ ] **Step 4: Verify the app starts**

```bash
pnpm dev
```

Expected: app loads at `http://localhost:3000` with sidebar, no errors in terminal.

- [ ] **Step 5: Commit**

```bash
git add app/app.vue app/stores/app.ts app/layouts/default.vue
git commit -m "feat: app skeleton with sidebar layout and pinia store"
```

---

## Task 6: Settings page

**Files:**
- Create: `app/pages/settings.vue`

- [ ] **Step 1: Create settings page**

Create `app/pages/settings.vue`:

```vue
<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const token = ref('')
const saving = ref(false)
const message = useMessage()

async function save() {
  if (!token.value.trim()) return
  saving.value = true
  try {
    await $fetch('/api/auth/token', {
      method: 'POST',
      body: { token: token.value.trim() },
    })
    await appStore.checkAuth()
    message.success('TB_TOKEN 已保存')
    token.value = ''
  } catch (e: any) {
    message.error(e.data?.message ?? '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
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
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/settings`. Paste a token and click 保存. Check that the success alert appears.

- [ ] **Step 3: Commit**

```bash
git add app/pages/settings.vue
git commit -m "feat: settings page for TB_TOKEN input"
```

---

## Task 7: Feed page

**Files:**
- Create: `app/components/PostCard.vue`
- Create: `app/pages/index.vue`

- [ ] **Step 1: Create PostCard component**

Create `app/components/PostCard.vue`:

```vue
<script setup lang="ts">
defineProps<{
  threadId: number
  title: string
  authorName: string
  replyNum: number
  lastTime: number
}>()
</script>

<template>
  <NuxtLink :to="`/p/${threadId}`" style="display: block; text-decoration: none; color: inherit">
    <a-card
      hoverable
      size="small"
      style="margin-bottom: 8px"
    >
      <div style="font-size: 15px; font-weight: 500; margin-bottom: 4px">{{ title }}</div>
      <div style="color: #888; font-size: 13px; display: flex; gap: 16px">
        <span>{{ authorName }}</span>
        <span>{{ replyNum }} 回复</span>
        <span>{{ new Date(lastTime * 1000).toLocaleString('zh-CN') }}</span>
      </div>
    </a-card>
  </NuxtLink>
</template>
```

- [ ] **Step 2: Create feed page**

Create `app/pages/index.vue`:

```vue
<script setup lang="ts">
const sortType = ref('0')
const pn = ref(1)

const { data, pending, error, refresh } = await useFetch(
  () => `/api/feed?sort_type=${sortType.value}&pn=${pn.value}`,
)

const threads = computed(() => data.value?.data?.thread_list ?? [])
const totalPage = computed(() => data.value?.data?.page?.total_page ?? 1)

watch([sortType], () => { pn.value = 1 })
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2 style="margin: 0">帖子列表</h2>
      <a-radio-group v-model:value="sortType" button-style="solid" size="small">
        <a-radio-button value="0">最新</a-radio-button>
        <a-radio-button value="3">热门</a-radio-button>
      </a-radio-group>
    </div>

    <a-spin :spinning="pending">
      <a-alert v-if="error" :message="error.message" type="error" show-icon style="margin-bottom: 12px" />

      <PostCard
        v-for="thread in threads"
        :key="thread.thread_id"
        :thread-id="thread.thread_id"
        :title="thread.title"
        :author-name="thread.author?.name ?? ''"
        :reply-num="thread.reply_num ?? 0"
        :last-time="thread.last_time_int ?? 0"
      />

      <a-empty v-if="!pending && threads.length === 0" description="暂无帖子" />
    </a-spin>

    <div style="margin-top: 16px; text-align: right">
      <a-pagination
        v-model:current="pn"
        :total="totalPage * 10"
        :page-size="10"
        :show-size-changer="false"
        size="small"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000`. With a valid token, the feed should load. Click 热门 to switch sort.

- [ ] **Step 4: Commit**

```bash
git add app/components/PostCard.vue app/pages/index.vue
git commit -m "feat: feed page with PostCard component"
```

---

## Task 8: Post detail page

**Files:**
- Create: `app/components/ReplyBox.vue`
- Create: `app/components/SubFloorItem.vue`
- Create: `app/components/FloorItem.vue`
- Create: `app/pages/p/[id].vue`

- [ ] **Step 1: Create ReplyBox component**

Create `app/components/ReplyBox.vue`:

```vue
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
```

- [ ] **Step 2: Create SubFloorItem component**

Create `app/components/SubFloorItem.vue`:

```vue
<script setup lang="ts">
defineProps<{
  postId: number
  threadId: number
  authorName: string
  content: string
  agreeNum: number
}>()

const emit = defineEmits<{
  like: [postId: number, threadId: number]
  reply: [postId: number]
}>()

const showReply = ref(false)
const replyLoading = ref(false)

async function handleReply(content: string) {
  replyLoading.value = true
  emit('reply', props.postId)
  replyLoading.value = false
  showReply.value = false
}
</script>

<template>
  <div style="padding: 6px 12px; background: #fafafa; border-radius: 4px; margin-bottom: 4px">
    <div style="display: flex; justify-content: space-between; align-items: flex-start">
      <div>
        <span style="font-weight: 500; font-size: 13px">{{ authorName }}</span>
        <span style="color: #555; font-size: 13px; margin-left: 8px; white-space: pre-wrap">{{ content }}</span>
      </div>
      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: 8px">
        <a-button type="link" size="small" @click="emit('like', postId, threadId)">
          👍 {{ agreeNum }}
        </a-button>
        <a-button type="link" size="small" @click="showReply = !showReply">回复</a-button>
      </div>
    </div>
    <ReplyBox v-if="showReply" :loading="replyLoading" @submit="handleReply" />
  </div>
</template>
```

- [ ] **Step 3: Create FloorItem component**

Create `app/components/FloorItem.vue`:

```vue
<script setup lang="ts">
const props = defineProps<{
  postId: number
  threadId: number
  floor: number
  authorName: string
  content: string
  agreeNum: number
  subPostCount: number
  isOp?: boolean
}>()

const emit = defineEmits<{
  like: [postId: number, threadId: number, objType: number]
  reply: [postId: number, threadId: number, content: string]
  delete: [postId: number, threadId: number]
}>()

const showReply = ref(false)
const showSubFloors = ref(false)
const replyLoading = ref(false)

const { data: subFloorData, pending: subPending, execute: loadSubFloors } = await useLazyFetch(
  () => `/api/floor?post_id=${props.postId}&thread_id=${props.threadId}`,
  { immediate: false },
)

const subFloors = computed(() => subFloorData.value?.data?.post_list ?? [])

async function toggleSubFloors() {
  if (!showSubFloors.value && subFloors.value.length === 0) {
    await loadSubFloors()
  }
  showSubFloors.value = !showSubFloors.value
}

async function handleReply(content: string) {
  replyLoading.value = true
  emit('reply', props.postId, props.threadId, content)
  replyLoading.value = false
  showReply.value = false
}

function handleSubLike(postId: number, threadId: number) {
  emit('like', postId, threadId, 2)
}
</script>

<template>
  <a-card size="small" style="margin-bottom: 8px">
    <template #title>
      <span style="color: #888; font-size: 13px">{{ floor }}楼</span>
      <span style="font-weight: 500; margin-left: 8px">{{ authorName }}</span>
    </template>
    <template #extra>
      <a-space>
        <a-button type="link" size="small" @click="emit('like', postId, threadId, isOp ? 3 : 1)">
          👍 {{ agreeNum }}
        </a-button>
        <a-button type="link" size="small" @click="showReply = !showReply">回复</a-button>
        <a-popconfirm title="确认删除？" @confirm="emit('delete', postId, threadId)">
          <a-button type="link" size="small" danger>删除</a-button>
        </a-popconfirm>
      </a-space>
    </template>

    <div style="white-space: pre-wrap">{{ content }}</div>

    <ReplyBox v-if="showReply" :loading="replyLoading" @submit="handleReply" />

    <div v-if="subPostCount > 0" style="margin-top: 8px">
      <a-button type="link" size="small" @click="toggleSubFloors">
        {{ showSubFloors ? '收起' : `查看 ${subPostCount} 条楼中楼` }}
      </a-button>
      <a-spin v-if="subPending" size="small" />
      <div v-if="showSubFloors" style="margin-top: 4px">
        <SubFloorItem
          v-for="sub in subFloors"
          :key="sub.post_id"
          :post-id="sub.post_id"
          :thread-id="threadId"
          :author-name="sub.author?.name ?? ''"
          :content="sub.content?.[0]?.text ?? ''"
          :agree-num="sub.agree?.agree_num ?? 0"
          @like="handleSubLike"
          @reply="(pid) => emit('reply', pid, threadId, '')"
        />
      </div>
    </div>
  </a-card>
</template>
```

- [ ] **Step 4: Create post detail page**

Create `app/pages/p/[id].vue`:

```vue
<script setup lang="ts">
import { message } from 'ant-design-vue'

const route = useRoute()
const threadId = computed(() => route.params.id as string)
const pn = ref(1)
const sort = ref('0')

const { data, pending, error, refresh } = await useFetch(
  () => `/api/post/${threadId.value}?pn=${pn.value}&r=${sort.value}`,
)

const thread = computed(() => data.value?.data?.thread ?? null)
const posts = computed(() => data.value?.data?.post_list ?? [])
const totalPage = computed(() => data.value?.data?.page?.total_page ?? 1)

async function handleLike(postId: number, tid: number, objType: number) {
  try {
    await $fetch('/api/agree', {
      method: 'POST',
      body: { thread_id: Number(tid), post_id: postId, obj_type: objType, op_type: 0 },
    })
    message.success('点赞成功')
  } catch (e: any) {
    message.error(e.data?.message ?? '点赞失败')
  }
}

async function handleReply(postId: number, tid: number, content: string) {
  if (!content) return
  try {
    const res = await $fetch<{ data: { thread_id: number; post_id: number } }>('/api/reply', {
      method: 'POST',
      body: { content, post_id: postId, thread_id: Number(tid) },
    })
    message.success(`回复成功 → /p/${res.data.thread_id}?pid=${res.data.post_id}`)
    refresh()
  } catch (e: any) {
    message.error(e.data?.message ?? '回复失败')
  }
}

async function handleDelete(postId: number, tid: number) {
  try {
    await $fetch('/api/delete', {
      method: 'POST',
      body: { type: 'post', post_id: postId, thread_id: Number(tid) },
    })
    message.success('删除成功')
    refresh()
  } catch (e: any) {
    message.error(e.data?.message ?? '删除失败')
  }
}
</script>

<template>
  <div>
    <a-spin :spinning="pending">
      <a-alert v-if="error" :message="error.message" type="error" show-icon style="margin-bottom: 12px" />

      <div v-if="thread" style="margin-bottom: 16px">
        <h2>{{ thread.title }}</h2>
        <div style="display: flex; gap: 12px; align-items: center">
          <a-radio-group v-model:value="sort" button-style="solid" size="small">
            <a-radio-button value="0">正序</a-radio-button>
            <a-radio-button value="1">倒序</a-radio-button>
            <a-radio-button value="2">热门</a-radio-button>
          </a-radio-group>
        </div>
      </div>

      <FloorItem
        v-for="post in posts"
        :key="post.post_id"
        :post-id="post.post_id"
        :thread-id="Number(threadId)"
        :floor="post.floor ?? 0"
        :author-name="post.author?.name ?? ''"
        :content="post.content?.[0]?.text ?? ''"
        :agree-num="post.agree?.agree_num ?? 0"
        :sub-post-count="post.sub_post_number ?? 0"
        :is-op="post.floor === 1"
        @like="handleLike"
        @reply="handleReply"
        @delete="handleDelete"
      />
    </a-spin>

    <div style="margin-top: 16px; text-align: right">
      <a-pagination
        v-model:current="pn"
        :total="totalPage * 30"
        :page-size="30"
        :show-size-changer="false"
        size="small"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 5: Verify in browser**

Click a post card from the feed. The post detail should open with floors. Try clicking 👍 and 回复.

- [ ] **Step 6: Commit**

```bash
git add app/components/ReplyBox.vue app/components/SubFloorItem.vue app/components/FloorItem.vue app/pages/p/
git commit -m "feat: post detail page with floor, sub-floor, reply and like"
```

---

## Task 9: Notifications page

**Files:**
- Create: `app/components/NotificationItem.vue`
- Create: `app/pages/notifications.vue`

- [ ] **Step 1: Create NotificationItem component**

Create `app/components/NotificationItem.vue`:

```vue
<script setup lang="ts">
defineProps<{
  threadId: number
  postId: number
  unread: boolean
  replyer: string
  content: string
  quoteContent: string
  time: number
}>()
</script>

<template>
  <NuxtLink :to="`/p/${threadId}`" style="text-decoration: none; color: inherit; display: block">
    <a-card
      size="small"
      hoverable
      :style="`margin-bottom: 8px; border-left: 3px solid ${unread ? '#1677ff' : '#f0f0f0'}`"
    >
      <div style="display: flex; justify-content: space-between">
        <span :style="`font-weight: ${unread ? '600' : '400'}`">{{ replyer }}</span>
        <span style="color: #888; font-size: 12px">
          {{ new Date(time * 1000).toLocaleString('zh-CN') }}
        </span>
      </div>
      <div v-if="quoteContent" style="color: #888; font-size: 13px; margin: 4px 0; padding: 4px 8px; background: #fafafa; border-radius: 4px">
        引用：{{ quoteContent }}
      </div>
      <div style="font-size: 14px; white-space: pre-wrap">{{ content }}</div>
    </a-card>
  </NuxtLink>
</template>
```

- [ ] **Step 2: Create notifications page**

Create `app/pages/notifications.vue`:

```vue
<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const pn = ref(1)

const { data, pending, error } = await useFetch(
  () => `/api/notifications?pn=${pn.value}`,
)

const replies = computed(() => data.value?.data?.reply_list ?? [])

// Refresh unread count in sidebar after viewing notifications
onMounted(() => appStore.refreshUnread())
</script>

<template>
  <div>
    <h2>消息通知</h2>

    <a-spin :spinning="pending">
      <a-alert v-if="error" :message="error.message" type="error" show-icon style="margin-bottom: 12px" />

      <NotificationItem
        v-for="(item, i) in replies"
        :key="i"
        :thread-id="item.thread_id"
        :post-id="item.post_id"
        :unread="item.unread === 1"
        :replyer="item.replyer?.name ?? ''"
        :content="item.content ?? ''"
        :quote-content="item.quote_content ?? ''"
        :time="item.time ?? 0"
      />

      <a-empty v-if="!pending && replies.length === 0" description="暂无消息" />
    </a-spin>

    <div style="margin-top: 16px; text-align: right">
      <a-pagination
        v-model:current="pn"
        :total="pn * 10 + 10"
        :page-size="10"
        :show-size-changer="false"
        size="small"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/notifications`. Unread items should have a blue left border. Clicking one navigates to the post.

- [ ] **Step 4: Commit**

```bash
git add app/components/NotificationItem.vue app/pages/notifications.vue
git commit -m "feat: notifications page"
```

---

## Task 10: New Post Modal

**Files:**
- Create: `app/components/NewPostModal.vue`

- [ ] **Step 1: Create NewPostModal component**

Create `app/components/NewPostModal.vue`:

```vue
<script setup lang="ts">
import { message } from 'ant-design-vue'
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

async function handleSubmit() {
  if (!title.value.trim() || !content.value.trim()) {
    message.warning('标题和内容不能为空')
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

    message.success('发帖成功')
    appStore.newPostModalVisible = false
    title.value = ''
    content.value = ''
    tabId.value = undefined
    router.push(`/p/${res.data.thread_id}`)
  } catch (e: any) {
    message.error(e.data?.message ?? '发帖失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
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
```

- [ ] **Step 2: Register modal in layout**

Edit `app/layouts/default.vue` — add inside `<a-layout>` (after `<a-layout-sider>`):

```vue
<!-- Add after the closing </a-layout-sider> tag, before </a-layout> -->
<NewPostModal />
```

- [ ] **Step 3: Verify in browser**

Click the 发帖 button in the sidebar. Fill in title + content + optional board. Submit. Verify you're redirected to the new post's page.

- [ ] **Step 4: Commit**

```bash
git add app/components/NewPostModal.vue app/layouts/default.vue
git commit -m "feat: new post modal"
```

---

## Self-Review Checklist

- [x] **Auth:** httpOnly cookie set/check ✓
- [x] **Browse routes:** feed, post detail, floor, notifications ✓
- [x] **Write routes:** thread, reply, agree, delete ✓
- [x] **Layout:** sidebar with nav + unread badge + 发帖 button ✓
- [x] **Settings:** token input with status feedback ✓
- [x] **Feed:** list + sort + pagination ✓
- [x] **Post detail:** floors + sub-floors + like + reply + delete ✓
- [x] **Notifications:** unread highlight + pagination ✓
- [x] **New post:** title/content/board selector, redirect on success ✓
- [x] No TBD or TODO placeholders ✓
- [x] 401 handled via layout banner ✓
- [x] Token never sent to client ✓
