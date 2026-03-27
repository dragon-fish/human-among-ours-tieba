export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { sort_type = '0', pn = '1' } = getQuery(event) as Record<string, string>
  return tiebaGet('/c/f/frs/page_claw', { sort_type, pn }, token)
})
