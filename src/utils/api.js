export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {})

  try {
    const token = await window?.Clerk?.session?.getToken?.({ template: 'integration_fallback' })
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  } catch (error) {
    console.warn('Unable to attach Clerk token, proceeding without it:', error)
  }

  const adminToken = (() => {
    try {
      return window?.localStorage?.getItem('vetwraps_admin_token')
    } catch {
      return null
    }
  })()

  if (adminToken) {
    headers.set('x-admin-token', adminToken)
  }

  return fetch(input, { ...init, headers })
}
