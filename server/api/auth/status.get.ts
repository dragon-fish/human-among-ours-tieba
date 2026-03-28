export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'tb_token')
  if (!token) return { authenticated: false }

  try {
    await tiebaGet('/c/f/frs/page_claw', { pn: '1' }, token)
    // Token valid — renew cookie for another 30 days
    setCookie(event, 'tb_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    })
    return { authenticated: true }
  } catch {
    // Token invalid — remove cookie
    deleteCookie(event, 'tb_token', { path: '/' })
    return { authenticated: false }
  }
})
