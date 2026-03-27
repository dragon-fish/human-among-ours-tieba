export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { post_id, thread_id } = getQuery(event) as Record<string, string>
  if (!post_id || !thread_id)
    throw createError({ statusCode: 400, message: 'post_id and thread_id required' })

  return tiebaGet('/c/f/pb/nestedFloor_claw', { post_id, thread_id }, token)
})
