export async function authFetch(input, init = {}) {
  const widget = window.netlifyIdentity
  const user = widget?.currentUser()
  let token
  if (user?.token?.access_token) token = user.token.access_token
  if (!token && typeof user?.jwt === 'function') {
    try { token = await user.jwt() } catch {}
  }
  const headers = new Headers(init.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const adminToken = localStorage.getItem('vetwraps_admin_token')
  if (adminToken) headers.set('x-admin-token', adminToken)
  return fetch(input, { ...init, headers })
}
