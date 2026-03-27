export const TIEBA_BASE = 'https://tieba.baidu.com'

export async function tiebaGet(
  path: string,
  params: Record<string, string>,
  token: string,
) {
  const url = new URL(TIEBA_BASE + path)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: token,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  if (data.errno !== 0) throw new Error(`[errno ${data.errno}] ${data.errmsg || 'Tieba error'}`)
  return data
}

export async function tiebaPost(
  path: string,
  body: Record<string, unknown>,
  token: string,
) {
  const res = await fetch(TIEBA_BASE + path, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  if (data.errno !== 0) throw new Error(`[errno ${data.errno}] ${data.errmsg || 'Tieba error'}`)
  return data
}
