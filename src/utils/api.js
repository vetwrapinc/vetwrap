export function getPortalToken() {
  return localStorage.getItem('vetwraps_portal_token') || ''
}

export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {})
  const token = getPortalToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
    headers.set('x-admin-token', token)
  }
  const opts = { ...init, headers }
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    opts.body = JSON.stringify(opts.body)
  }
  return fetch(input, opts)
}
