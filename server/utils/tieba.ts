export const TIEBA_BASE = 'https://tieba.baidu.com'

// API uses 3 different error patterns:
// Browse APIs (GET): { error_code, error_msg }
// Write APIs (POST): { errno, errmsg }
// replyme API: { no, error }
function checkTiebaError(data: any) {
  const code = data.error_code ?? data.errno ?? data.no
  if (code !== undefined && code !== 0) {
    const msg = data.error_msg ?? data.errmsg ?? data.error ?? 'Tieba error'
    throw new Error(`[error ${code}] ${msg}`)
  }
}

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
  checkTiebaError(data)
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
  checkTiebaError(data)
  return data
}
