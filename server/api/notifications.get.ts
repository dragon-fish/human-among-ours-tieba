export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { pn = '1' } = getQuery(event) as Record<string, string>
  return tiebaGet('/mo/q/claw/replyme', { pn }, token)
})
