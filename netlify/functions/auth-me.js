const { json, verifyPortalToken } = require('./_auth')
const {
  fetchAssignments,
  fetchUsersByRole,
  fetchUsersByIds,
} = require('./_portal')

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method Not Allowed' })
  }

  let session
  try {
    session = verifyPortalToken(event, { allowRoles: ['admin', 'employee', 'client'] })
  } catch (err) {
    return json(401, { error: err.message || 'Unauthorized' })
  }

  const payload = session.payload || {}
  const user = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  }

  try {
    if (user.role === 'admin') {
      const [employees, clients, assignments] = await Promise.all([
        fetchUsersByRole('employee'),
        fetchUsersByRole('client'),
        fetchAssignments(),
      ])

      const assignmentMap = new Map(assignments.map((item) => [item.client_id, item.employee_id || null]))
      const employeeCounts = new Map()
      for (const item of assignments) {
        if (item.employee_id) {
          employeeCounts.set(item.employee_id, (employeeCounts.get(item.employee_id) || 0) + 1)
        }
      }

      const enrichedClients = clients.map((client) => {
        const employeeId = assignmentMap.get(client.id)
        const employee = employees.find((emp) => emp.id === employeeId) || null
        return {
          ...client,
          assignment: employee
            ? {
                id: employee.id,
                name: employee.name,
                email: employee.email,
              }
            : null,
        }
      })

      const enrichedEmployees = employees.map((emp) => ({
        ...emp,
        clientCount: employeeCounts.get(emp.id) || 0,
      }))

      return json(200, {
        user,
        admin: {
          employees: enrichedEmployees,
          clients: enrichedClients,
        },
      })
    }

    if (user.role === 'employee') {
      const assignments = await fetchAssignments({ employeeId: user.id })
      const clientIds = assignments.map((item) => item.client_id).filter(Boolean)
      const clients = await fetchUsersByIds(clientIds)
      const clientMap = new Map(clients.map((client) => [client.id, client]))
      const ordered = assignments
        .map((assignment) => clientMap.get(assignment.client_id))
        .filter(Boolean)
      return json(200, {
        user,
        employee: {
          clients: ordered,
        },
      })
    }

    if (user.role === 'client') {
      const assignments = await fetchAssignments({ clientId: user.id })
      const employeeId = assignments[0]?.employee_id
      let employee = null
      if (employeeId) {
        const [detail] = await fetchUsersByIds([employeeId])
        if (detail) employee = detail
      }
      return json(200, {
        user,
        client: {
          employee,
        },
      })
    }

    return json(200, { user })
  } catch (err) {
    return json(500, { error: 'Failed to load profile', detail: err.message })
  }
}
