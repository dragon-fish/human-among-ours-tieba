export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id is required' })
  const { pn = '1', r = '0' } = getQuery(event) as Record<string, string>
  return tiebaGet('/c/f/pb/page_claw', { kz: id, pn, r }, token)
})
