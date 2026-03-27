export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  return tiebaPost('/c/c/claw/opAgree', body, token)
})
