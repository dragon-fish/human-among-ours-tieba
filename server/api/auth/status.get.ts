export default defineEventHandler((event) => {
  const token = getCookie(event, 'tb_token')
  return { authenticated: !!token }
})
