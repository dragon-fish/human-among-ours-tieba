export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody<{ type: 'thread' | 'post'; thread_id?: number; post_id?: number }>(event)

  if (body.type !== 'thread' && body.type !== 'post')
    throw createError({ statusCode: 400, message: 'type must be "thread" or "post"' })

  if (body.type === 'thread' && !body.thread_id)
    throw createError({ statusCode: 400, message: 'thread_id is required for type "thread"' })

  if (body.type === 'post' && !body.post_id)
    throw createError({ statusCode: 400, message: 'post_id is required for type "post"' })

  const path = body.type === 'thread' ? '/c/c/claw/delThread' : '/c/c/claw/delPost'
  const payload = body.type === 'thread'
    ? { thread_id: body.thread_id }
    : { post_id: body.post_id }
  return tiebaPost(path, payload, token)
})
