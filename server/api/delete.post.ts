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
