export default defineEventHandler(async (event) => {
  const { token } = await readBody<{ token: string }>(event)
  if (!token?.trim()) throw createError({ statusCode: 400, message: 'token is required' })

  setCookie(event, 'tb_token', token.trim(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return { ok: true }
})
