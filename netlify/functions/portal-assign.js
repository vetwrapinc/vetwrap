const { json, verifyPortalToken } = require('./_auth')
const { supabaseMutate } = require('./_portal')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' })
  }

  try {
    verifyPortalToken(event, { requireRole: 'admin' })
  } catch (err) {
    return json(401, { error: err.message || 'Unauthorized' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  const clientId = String(body.clientId || '').trim()
  const employeeId = body.employeeId ? String(body.employeeId).trim() : null
  if (!clientId) {
    return json(400, { error: 'clientId is required' })
  }

  try {
    if (employeeId) {
      const result = await supabaseMutate('portal_assignments', {
        method: 'POST',
        body: {
          client_id: clientId,
          employee_id: employeeId,
        },
        prefer: 'resolution=merge-duplicates,return=representation',
      })
      return json(200, { assignment: result?.[0] || null })
    }

    await supabaseMutate('portal_assignments', {
      method: 'DELETE',
      filters: { client_id: `eq.${clientId}` },
      prefer: 'return=minimal',
    })
    return json(200, { assignment: null })
  } catch (err) {
    return json(500, { error: 'Failed to update assignment', detail: err.message })
  }
}
