import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useIdentity } from '../utils/identity'
import { authFetch } from '../utils/api'

const employeeStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'former', label: 'Former' }
]

const employeeStatusLabels = employeeStatusOptions.reduce((acc, item) => {
  acc[item.value] = item.label
  return acc
}, {})

const quoteStatusOptions = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'processed', label: 'Processed' }
]

const accessRoleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
  { value: 'client', label: 'Client' }
]

const accessStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' }
]

const emptyEmployeeForm = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  phone: '',
  startDate: '',
  status: 'active',
  hourlyRate: '',
  notes: ''
}

const emptyAccessForm = {
  id: '',
  email: '',
  name: '',
  role: 'employee',
  status: 'active',
  notes: ''
}

export default function Subscribers() {
  const { user, ready, login, logout, access, refreshAccess } = useIdentity()
  const initialToken = React.useMemo(() => {
    try {
      return localStorage.getItem('vetwraps_admin_token') || ''
    } catch {
      return ''
    }
  }, [])
  const [storedAdminToken, setStoredAdminToken] = React.useState(initialToken)
  const [adminTokenInput, setAdminTokenInput] = React.useState(initialToken)

  const [view, setView] = React.useState('employees')
  const [employees, setEmployees] = React.useState([])
  const [employeeError, setEmployeeError] = React.useState(null)
  const [employeeMessage, setEmployeeMessage] = React.useState(null)
  const [employeeForm, setEmployeeForm] = React.useState(emptyEmployeeForm)
  const [savingEmployee, setSavingEmployee] = React.useState(false)
  const [deletingEmployeeId, setDeletingEmployeeId] = React.useState(null)
  const [updatingStatusId, setUpdatingStatusId] = React.useState(null)
  const [loadingEmployees, setLoadingEmployees] = React.useState(false)

  const [quotes, setQuotes] = React.useState([])
  const [quotesError, setQuotesError] = React.useState(null)
  const [quoteMessage, setQuoteMessage] = React.useState(null)
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [loadingQuotes, setLoadingQuotes] = React.useState(false)

  const [accessGrants, setAccessGrants] = React.useState([])
  const [loadingAccessGrants, setLoadingAccessGrants] = React.useState(false)
  const [accessMessage, setAccessMessage] = React.useState(null)
  const [accessForm, setAccessForm] = React.useState(emptyAccessForm)
  const [savingAccess, setSavingAccess] = React.useState(false)
  const [deletingAccessId, setDeletingAccessId] = React.useState(null)
  const [updatingAccessId, setUpdatingAccessId] = React.useState(null)
  const [accessStatusFilter, setAccessStatusFilter] = React.useState('all')
  const [accessRoleFilter, setAccessRoleFilter] = React.useState('all')
  const [accessSearch, setAccessSearch] = React.useState('')

  const accessChecked = storedAdminToken ? true : access.checked
  const hasIdentityAccess = ready && accessChecked && access.allowed
  const hasAccess = Boolean(storedAdminToken || hasIdentityAccess)
  const role = storedAdminToken ? 'admin' : access.grant?.role || null
  const welcomeName =
    access.grant?.name ||
    user?.user_metadata?.full_name ||
    user?.full_name ||
    user?.email ||
    (storedAdminToken ? 'Admin' : '')
  const canViewEmployees = Boolean(storedAdminToken || role === 'admin' || role === 'employee')
  const canManageEmployees = Boolean(storedAdminToken || role === 'admin')
  const canViewClients = Boolean(storedAdminToken || role === 'admin' || role === 'employee' || role === 'client')
  const canManageQuotes = Boolean(storedAdminToken || role === 'admin' || role === 'employee')
  const canManageAccess = Boolean(storedAdminToken || role === 'admin')
  const accessReason = access.reason || ''
  const identityChecking = Boolean(!storedAdminToken && user && ready && (!access.checked || access.loading))
  const employeeFormDisabled = !canManageEmployees
  const quotesReadOnly = !canManageQuotes

  const loadEmployees = React.useCallback(async () => {
    setEmployeeError(null)
    setLoadingEmployees(true)
    try {
      const res = await authFetch('/api/employees-list')
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load employees')
      }
      const items = Array.isArray(data.items) ? data.items.map(mapEmployeeRecord) : []
      setEmployees(items)
    } catch (err) {
      setEmployees([])
      setEmployeeError(err.message || 'Failed to load employees')
    } finally {
      setLoadingEmployees(false)
    }
  }, [])

  const loadQuotes = React.useCallback(async () => {
    setQuotesError(null)
    setLoadingQuotes(true)
    try {
      const res = await authFetch('/api/quotes-list')
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load clients')
      }
      const items = Array.isArray(data.items)
        ? data.items.map((item) => ({ ...item, status: item.status || 'new' }))
        : []
      setQuotes(items)
    } catch (err) {
      setQuotes([])
      setQuotesError(err.message || 'Failed to load clients')
    } finally {
      setLoadingQuotes(false)
    }
  }, [])

  const loadAccessGrants = React.useCallback(async () => {
    if (!canManageAccess) return
    setLoadingAccessGrants(true)
    try {
      const res = await authFetch('/api/access-grants-list')
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load access list')
      }
      const items = Array.isArray(data.items) ? data.items.map(mapAccessGrant) : []
      setAccessGrants(items)
    } catch (err) {
      setAccessGrants([])
      setAccessMessage({ type: 'error', text: err.message || 'Failed to load access list' })
    } finally {
      setLoadingAccessGrants(false)
    }
  }, [canManageAccess])

  React.useEffect(() => {
    if (!ready) return
    if (!storedAdminToken && !accessChecked) return
    if (!hasAccess) {
      setEmployees([])
      setQuotes([])
      if (!storedAdminToken) setAccessGrants([])
      return
    }
    if (canViewEmployees) {
      loadEmployees()
    } else {
      setEmployees([])
    }
    if (canViewClients) {
      loadQuotes()
    } else {
      setQuotes([])
    }
    if (canManageAccess) {
      loadAccessGrants()
    }
  }, [
    ready,
    storedAdminToken,
    accessChecked,
    hasAccess,
    canViewEmployees,
    canViewClients,
    canManageAccess,
    loadEmployees,
    loadQuotes,
    loadAccessGrants
  ])
  function handleUseToken() {
    const trimmed = adminTokenInput.trim()
    if (!trimmed) return
    localStorage.setItem('vetwraps_admin_token', trimmed)
    setStoredAdminToken(trimmed)
    setQuotesError(null)
    setEmployeeError(null)
    setAccessMessage(null)
    setView((prev) => (prev === 'clients' && !canViewClients ? 'employees' : prev))
  }

  function handleClearToken() {
    localStorage.removeItem('vetwraps_admin_token')
    setStoredAdminToken('')
    setAdminTokenInput('')
    setEmployees([])
    setQuotes([])
    setAccessGrants([])
    setAccessForm(emptyAccessForm)
    setAccessMessage(null)
    refreshAccess()
  }

  React.useEffect(() => {
    if (view === 'access' && !canManageAccess) {
      if (canViewEmployees) setView('employees')
      else if (canViewClients) setView('clients')
    } else if (view === 'employees' && !canViewEmployees) {
      if (canViewClients) setView('clients')
      else if (canManageAccess) setView('access')
    } else if (view === 'clients' && !canViewClients) {
      if (canViewEmployees) setView('employees')
      else if (canManageAccess) setView('access')
    }
  }, [view, canManageAccess, canViewEmployees, canViewClients])

  function handleAccessInputChange(e) {
    const { name, value } = e.target
    setAccessForm((prev) => ({ ...prev, [name]: value }))
  }

  function startEditingAccess(grant) {
    setAccessMessage(null)
    setAccessForm({
      id: grant.id || '',
      email: grant.email || '',
      name: grant.name || '',
      role: grant.role || 'client',
      status: grant.status || 'active',
      notes: grant.notes || ''
    })
  }

  function resetAccessForm() {
    setAccessForm(emptyAccessForm)
  }

  async function persistAccess(payload) {
    const res = await authFetch('/api/access-grants-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    let data = {}
    try {
      data = await res.json()
    } catch {
      data = {}
    }
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save access record')
    }
    return data.item
  }

  async function handleSaveAccess(e) {
    e.preventDefault()
    if (!canManageAccess) return
    const trimmedEmail = accessForm.email.trim().toLowerCase()
    if (!trimmedEmail) {
      setAccessMessage({ type: 'error', text: 'Email is required.' })
      return
    }
    setSavingAccess(true)
    setAccessMessage(null)
    try {
      const payload = {
        id: accessForm.id || undefined,
        email: trimmedEmail,
        name: accessForm.name.trim(),
        role: accessForm.role,
        status: accessForm.status,
        notes: accessForm.notes.trim()
      }
      await persistAccess(payload)
      setAccessMessage({ type: 'success', text: accessForm.id ? 'Access updated.' : 'Access granted.' })
      resetAccessForm()
      await loadAccessGrants()
      refreshAccess()
    } catch (err) {
      setAccessMessage({ type: 'error', text: err.message || 'Failed to save access record' })
    } finally {
      setSavingAccess(false)
    }
  }

  async function handleToggleAccessStatus(grant, nextStatus) {
    if (!canManageAccess) return
    setAccessMessage(null)
    setUpdatingAccessId(grant.id)
    try {
      await persistAccess({
        id: grant.id,
        email: grant.email,
        name: grant.name || '',
        role: grant.role || 'client',
        status: nextStatus,
        notes: grant.notes || ''
      })
      setAccessMessage({
        type: 'success',
        text: nextStatus === 'active' ? 'Access reinstated.' : 'Access suspended.'
      })
      await loadAccessGrants()
      refreshAccess()
    } catch (err) {
      setAccessMessage({ type: 'error', text: err.message || 'Failed to update access status' })
    } finally {
      setUpdatingAccessId(null)
    }
  }

  async function handleDeleteAccess(id) {
    if (!canManageAccess || !id) return
    if (typeof window !== 'undefined' && !window.confirm('Remove this account?')) return
    setAccessMessage(null)
    setDeletingAccessId(id)
    try {
      const res = await authFetch('/api/access-grants-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove access')
      }
      if (accessForm.id === id) {
        resetAccessForm()
      }
      setAccessMessage({ type: 'success', text: 'Access removed.' })
      await loadAccessGrants()
      refreshAccess()
    } catch (err) {
      setAccessMessage({ type: 'error', text: err.message || 'Failed to remove access' })
    } finally {
      setDeletingAccessId(null)
    }
  }

  function handleEmployeeInputChange(e) {
    const { name, value } = e.target
    setEmployeeForm((prev) => ({ ...prev, [name]: value }))
  }

  function startEditingEmployee(emp) {
    setEmployeeMessage(null)
    setEmployeeForm({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      role: emp.role,
      phone: emp.phone || '',
      startDate: emp.startDate || '',
      status: emp.status || 'active',
      hourlyRate: emp.hourlyRate != null && emp.hourlyRate !== '' ? String(emp.hourlyRate) : '',
      notes: emp.notes || ''
    })
    setView('employees')
  }

  function resetEmployeeForm() {
    setEmployeeForm(emptyEmployeeForm)
  }

  async function handleSaveEmployee(e) {
    e.preventDefault()
    if (!canManageEmployees) {
      setEmployeeMessage({ type: 'error', text: 'Only administrators can modify team members.' })
      return
    }
    setEmployeeMessage(null)
    setSavingEmployee(true)
    try {
      const payload = prepareEmployeePayload(employeeForm)
      const saved = await persistEmployee(payload)
      setEmployeeMessage({ type: 'success', text: payload.id ? 'Employee updated.' : 'Employee added.' })
      resetEmployeeForm()
      await loadEmployees()
      return saved
    } catch (err) {
      setEmployeeMessage({ type: 'error', text: err.message || 'Failed to save employee' })
      throw err
    } finally {
      setSavingEmployee(false)
    }
  }

  async function handleDeleteEmployee(id) {
    if (!id || !canManageEmployees) return
    if (typeof window !== 'undefined' && !window.confirm('Remove this employee?')) return
    setEmployeeMessage(null)
    setDeletingEmployeeId(id)
    try {
      const res = await authFetch('/api/employees-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete employee')
      }
      if (employeeForm.id === id) {
        resetEmployeeForm()
      }
      setEmployeeMessage({ type: 'success', text: 'Employee removed.' })
      await loadEmployees()
    } catch (err) {
      setEmployeeMessage({ type: 'error', text: err.message || 'Failed to delete employee' })
    } finally {
      setDeletingEmployeeId(null)
    }
  }

  async function handleStatusChange(id, status) {
    const target = employees.find((emp) => emp.id === id)
    if (!target || !canManageEmployees) return
    setEmployeeMessage(null)
    setUpdatingStatusId(id)
    try {
      await persistEmployee(prepareEmployeePayload({ ...target, status }))
      setEmployeeMessage({ type: 'success', text: `Status updated to ${employeeStatusLabels[status]}` })
      await loadEmployees()
    } catch (err) {
      setEmployeeMessage({ type: 'error', text: err.message || 'Failed to update status' })
    } finally {
      setUpdatingStatusId(null)
    }
  }

  async function persistEmployee(payload) {
    const res = await authFetch('/api/employees-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    let data = {}
    try {
      data = await res.json()
    } catch {
      data = {}
    }
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save employee')
    }
    return data.item
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value)
  }

  async function handleRefreshAll() {
    await Promise.all([
      canViewEmployees ? loadEmployees() : Promise.resolve(),
      canViewClients ? loadQuotes() : Promise.resolve(),
      canManageAccess ? loadAccessGrants() : Promise.resolve()
    ])
    if (!storedAdminToken) {
      refreshAccess()
    }
  }
  const employeesStats = React.useMemo(() => computeEmployeeStats(employees), [employees])
  const recentHires = React.useMemo(() => computeRecentHires(employees), [employees])
  const anniversaries = React.useMemo(() => computeUpcomingAnniversaries(employees), [employees])
  const clientsStats = React.useMemo(() => computeClientStats(quotes), [quotes])
  const accessStats = React.useMemo(() => computeAccessStats(accessGrants), [accessGrants])
  const filteredAccessGrants = React.useMemo(() => {
    const search = accessSearch.trim().toLowerCase()
    return accessGrants
      .filter((item) => (accessStatusFilter === 'all' ? true : item.status === accessStatusFilter))
      .filter((item) => (accessRoleFilter === 'all' ? true : item.role === accessRoleFilter))
      .filter((item) => {
        if (!search) return true
        return [item.email, item.name, item.notes, item.role]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(search))
      })
  }, [accessGrants, accessStatusFilter, accessRoleFilter, accessSearch])

  const filteredQuotes = React.useMemo(() => {
    const needle = searchTerm.trim().toLowerCase()
    return quotes.filter((q) => {
      if (statusFilter !== 'all' && (q.status || 'new') !== statusFilter) {
        return false
      }
      if (!needle) return true
      const haystack = [
        q.name,
        q.email,
        q.projectType,
        q.notes,
        q.ip,
        q.userAgent,
        q.assignee
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [quotes, statusFilter, searchTerm])

  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Operations Dashboard - VetWraps</title>
      </Helmet>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        {!ready || identityChecking ? (
          <p className="text-white/70">{identityChecking ? 'Verifying access…' : 'Loading…'}</p>
        ) : !hasAccess ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Restricted</h1>
            {user && !storedAdminToken ? (
              <p className="text-white/70 mt-2 text-sm">
                {accessReason || 'Your Google account has not been approved yet.'}
              </p>
            ) : (
              <p className="text-white/70 mt-2 text-sm">Provide an admin token or sign in.</p>
            )}
            <div className="mt-4 max-w-sm mx-auto space-y-3">
              <input
                value={adminTokenInput}
                onChange={(e) => setAdminTokenInput(e.target.value)}
                placeholder="x-admin-token"
                className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2 text-sm"
              />
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleUseToken}
                  className="px-4 py-2 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50"
                >
                  Use Token
                </button>
                {!user ? (
                  <button
                    onClick={login}
                    className="px-4 py-2 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50"
                  >
                    Sign In
                  </button>
                ) : (
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded bg-white/10 border border-white/15 hover:border-accent-amber/50"
                  >
                    Sign Out
                  </button>
                )}
              </div>
              {user && !storedAdminToken && (
                <p className="text-xs text-white/50">
                  Ask an administrator to authorize <span className="font-semibold text-white/70">{user.email}</span> or
                  provide an admin token.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Operations Dashboard</h1>
                <p className="text-white/70 mt-2 text-sm">Welcome, {welcomeName}.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {storedAdminToken && (
                  <button
                    onClick={handleClearToken}
                    className="px-4 py-2 text-sm rounded bg-white/5 border border-white/10 hover:border-accent-amber/50"
                  >
                    Clear Admin Token
                  </button>
                )}
                {user && (
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm rounded bg-white/5 border border-white/10 hover:border-accent-blue/50"
                  >
                    Log out
                  </button>
                )}
                <button
                  onClick={handleRefreshAll}
                  className="px-4 py-2 text-sm rounded bg-white/5 border border-white/10 hover:border-accent-blue/50"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {canViewEmployees && (
                <button
                  onClick={() => setView('employees')}
                  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase rounded border ${
                    view === 'employees'
                      ? 'border-accent-blue/60 bg-accent-blue/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  Team
                </button>
              )}
              {canViewClients && (
                <button
                  onClick={() => setView('clients')}
                  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase rounded border ${
                    view === 'clients'
                      ? 'border-accent-blue/60 bg-accent-blue/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  Clients
                </button>
              )}
              {canManageAccess && (
                <button
                  onClick={() => setView('access')}
                  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase rounded border ${
                    view === 'access'
                      ? 'border-accent-blue/60 bg-accent-blue/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  Access
                </button>
              )}
            </div>
            {view === 'employees' && canViewEmployees ? (
              <section className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Total Staff" value={employeesStats.total} description={`${employeesStats.active} active`} />
                  <StatCard label="On Leave" value={employeesStats.onLeave} description={`${employeesStats.former} former`} />
                  <StatCard label="Avg Tenure" value={employeesStats.avgTenureLabel} description={`${employeesStats.newThisQuarter} hired last 90 days`} />
                  <StatCard
                    label="Avg Hourly Rate"
                    value={employeesStats.avgRateLabel}
                    description={employeesStats.avgRateLabel === '-' ? 'Add rates to track averages' : 'Based on recorded rates'}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl glass border border-glass p-5">
                    <h2 className="text-sm font-semibold tracking-wide uppercase text-white/70">Recent hires</h2>
                    {recentHires.length === 0 ? (
                      <p className="mt-3 text-sm text-white/60">No recent hires recorded.</p>
                    ) : (
                      <ul className="mt-3 space-y-2 text-sm text-white/80">
                        {recentHires.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-3">
                            <span>{item.name}</span>
                            <span className="text-white/50 text-xs">{item.startLabel}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="rounded-xl glass border border-glass p-5">
                    <h2 className="text-sm font-semibold tracking-wide uppercase text-white/70">Upcoming anniversaries</h2>
                    {anniversaries.length === 0 ? (
                      <p className="mt-3 text-sm text-white/60">No anniversaries within 60 days.</p>
                    ) : (
                      <ul className="mt-3 space-y-2 text-sm text-white/80">
                        {anniversaries.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-3">
                            <span>{item.name}</span>
                            <span className="text-white/50 text-xs">{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveEmployee} className="rounded-xl glass border border-glass p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {employeeForm.id ? 'Update Employee' : 'Add Employee'}
                    </h2>
                    {employeeForm.id && (
                      <button
                        type="button"
                        onClick={resetEmployeeForm}
                        className="text-sm text-white/70 hover:text-white"
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                  <fieldset disabled={employeeFormDisabled} className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm mb-1">First Name</label>
                      <input
                        id="firstName"
                        name="firstName"
                        value={employeeForm.firstName}
                        onChange={handleEmployeeInputChange}
                        required
                        autoComplete="given-name"
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm mb-1">Last Name</label>
                      <input
                        id="lastName"
                        name="lastName"
                        value={employeeForm.lastName}
                        onChange={handleEmployeeInputChange}
                        required
                        autoComplete="family-name"
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-sm mb-1">Role</label>
                      <input
                        id="role"
                        name="role"
                        value={employeeForm.role}
                        onChange={handleEmployeeInputChange}
                        required
                        autoComplete="organization-title"
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm mb-1">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={employeeForm.email}
                        onChange={handleEmployeeInputChange}
                        required
                        autoComplete="email"
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm mb-1">Phone</label>
                      <input
                        id="phone"
                        name="phone"
                        value={employeeForm.phone}
                        onChange={handleEmployeeInputChange}
                        autoComplete="tel"
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="startDate" className="block text-sm mb-1">Start Date</label>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={employeeForm.startDate}
                        onChange={handleEmployeeInputChange}
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm mb-1">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={employeeForm.status}
                        onChange={handleEmployeeInputChange}
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      >
                        {employeeStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="hourlyRate" className="block text-sm mb-1">Hourly Rate</label>
                      <input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={employeeForm.hourlyRate}
                        onChange={handleEmployeeInputChange}
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="notes" className="block text-sm mb-1">Notes</label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={employeeForm.notes}
                        onChange={handleEmployeeInputChange}
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                  </fieldset>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingEmployee || employeeFormDisabled}
                      className="px-5 py-2 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50 disabled:opacity-60"
                    >
                      {savingEmployee ? 'Saving…' : employeeForm.id ? 'Update Employee' : 'Add Employee'}
                    </button>
                    <button
                      type="button"
                      onClick={resetEmployeeForm}
                      className="text-sm text-white/70 hover:text-white"
                      disabled={employeeFormDisabled}
                    >
                      Reset
                    </button>
                  </div>
                  {employeeFormDisabled && (
                    <p className="mt-3 text-sm text-white/60">Only administrators can make staffing changes.</p>
                  )}
                  {employeeMessage && (
                    <p className={`mt-3 text-sm ${employeeMessage.type === 'error' ? 'text-red-400' : 'text-accent-blue'}`}>
                      {employeeMessage.text}
                    </p>
                  )}
                </form>

                <div className="rounded-xl glass border border-glass p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight">Team Directory</h2>
                    {loadingEmployees && <span className="text-sm text-white/60">Refreshing…</span>}
                  </div>
                  {employeeError && (
                    <p className="mt-3 text-sm text-red-400">{employeeError}</p>
                  )}
                  {!loadingEmployees && employees.length === 0 && !employeeError ? (
                    <p className="mt-3 text-sm text-white/60">No team members recorded yet.</p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-white/60">
                          <tr>
                            <th className="text-left py-2 pr-4">Name</th>
                            <th className="text-left py-2 pr-4">Role</th>
                            <th className="text-left py-2 pr-4">Email</th>
                            <th className="text-left py-2 pr-4">Phone</th>
                            <th className="text-left py-2 pr-4">Start Date</th>
                            <th className="text-left py-2 pr-4">Tenure</th>
                            <th className="text-left py-2 pr-4">Status</th>
                            <th className="text-left py-2 pr-4">Rate</th>
                            <th className="text-left py-2 pr-4">Notes</th>
                            <th className="text-left py-2 pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((emp) => (
                            <tr key={emp.id} className="border-t border-white/10">
                              <td className="py-2 pr-4 font-medium">{emp.firstName} {emp.lastName}</td>
                              <td className="py-2 pr-4">{emp.role}</td>
                              <td className="py-2 pr-4 break-all text-white/80">{emp.email}</td>
                              <td className="py-2 pr-4 text-white/70">{emp.phone || '-'}</td>
                              <td className="py-2 pr-4 text-white/70">{emp.startDate ? formatDateShort(emp.startDate) : '-'}</td>
                              <td className="py-2 pr-4 text-white/70">{emp.startDate ? formatTenure(emp.startDate) : '-'}</td>
                              <td className="py-2 pr-4">
                                <select
                                  value={emp.status}
                                  onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                                  disabled={
                                    employeeFormDisabled || updatingStatusId === emp.id || deletingEmployeeId === emp.id
                                  }
                                  className="bg-white/5 border-white/15 rounded px-2 py-1 text-xs"
                                >
                                  {employeeStatusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 pr-4 text-white/70">{emp.hourlyRate != null ? formatCurrency(emp.hourlyRate) : '-'}</td>
                              <td className="py-2 pr-4 max-w-xs whitespace-pre-wrap break-words text-white/70">{emp.notes || '-'}</td>
                              <td className="py-2 pr-4">
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <button
                                    onClick={() => startEditingEmployee(emp)}
                                    disabled={employeeFormDisabled}
                                    className="px-2 py-1 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                    disabled={employeeFormDisabled || deletingEmployeeId === emp.id}
                                    className="px-2 py-1 rounded bg-white/10 border border-white/15 hover:border-accent-amber/50 disabled:opacity-60"
                                  >
                                    {deletingEmployeeId === emp.id ? 'Removing…' : 'Remove'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            ) : view === 'clients' && canViewClients ? (
              <section className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Total Requests" value={clientsStats.total} description={`${clientsStats.processed} processed`} />
                  <StatCard label="Active Pipeline" value={clientsStats.pending} description={`${clientsStats.newCount} new / ${clientsStats.inProgress} in progress`} />
                  <StatCard label="Rush Jobs" value={clientsStats.rushCount} description={`Value ${clientsStats.rushValueLabel}`} />
                  <StatCard label="Last Submission" value={clientsStats.lastSubmissionLabel} description={clientsStats.avgAgeLabel} />
                </div>

                <div className="rounded-xl glass border border-glass p-6 space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-wrap gap-3 items-end">
                      <label className="text-sm">
                        <span className="block mb-1 text-white/70">Status</span>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-white/5 border-white/15 rounded px-3 py-2 text-sm"
                        >
                          {quoteStatusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="block mb-1 text-white/70">Search</span>
                        <input
                          value={searchTerm}
                          onChange={handleSearchChange}
                          placeholder="Name, email, notes…"
                          className="bg-white/5 border-white/15 rounded px-3 py-2 text-sm min-w-[220px]"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => exportQuotesToCsv(filteredQuotes)}
                        type="button"
                        className="px-4 py-2 text-sm rounded bg-white/5 border border-white/10 hover:border-accent-blue/50"
                        disabled={filteredQuotes.length === 0}
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={loadQuotes}
                        type="button"
                        className="px-4 py-2 text-sm rounded bg-white/5 border border-white/10 hover:border-accent-blue/50"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                  {quotesReadOnly && (
                    <p className="text-xs text-white/60">
                      Your role allows you to review client submissions without updating their status.
                    </p>
                  )}
                  {quoteMessage && (
                    <p className={`text-sm ${quoteMessage.type === 'error' ? 'text-red-400' : 'text-accent-blue'}`}>
                      {quoteMessage.text}
                    </p>
                  )}
                  {quotesError && (
                    <p className="text-sm text-red-400">{quotesError}</p>
                  )}
                  {loadingQuotes && <p className="text-sm text-white/60">Loading latest submissions…</p>}
                  {!loadingQuotes && filteredQuotes.length === 0 && !quotesError ? (
                    <p className="text-sm text-white/60">No submissions match the current filters.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-white/60">
                          <tr>
                            <th className="text-left py-2 pr-4">Created</th>
                            <th className="text-left py-2 pr-4">Name</th>
                            <th className="text-left py-2 pr-4">Email</th>
                            <th className="text-left py-2 pr-4">Project</th>
                            <th className="text-left py-2 pr-4">Rush</th>
                            <th className="text-left py-2 pr-4">Rush Fee</th>
                            <th className="text-left py-2 pr-4">Notes</th>
                            <th className="text-left py-2 pr-4">IP</th>
                            <th className="text-left py-2 pr-4">User Agent</th>
                            <th className="text-left py-2 pr-4">Status</th>
                            <th className="text-left py-2 pr-4">Assignee</th>
                            <th className="text-left py-2 pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredQuotes.map((q) => (
                            <tr key={q.id} className={`border-t border-white/10 ${isDueSoon(q) ? 'bg-accent-amber/5' : ''}`}>
                              <td className="py-2 pr-4 text-white/70">{formatDate(q.createdAt)}</td>
                              <td className="py-2 pr-4 font-medium">{q.name}</td>
                              <td className="py-2 pr-4 text-white/80 break-all">{q.email}</td>
                              <td className="py-2 pr-4">{q.projectType}</td>
                              <td className="py-2 pr-4">{q.rush ? 'Yes' : 'No'}</td>
                              <td className="py-2 pr-4 text-white/70">{q.amountRush ? formatCurrency(q.amountRush) : '-'}</td>
                              <td className="py-2 pr-4 max-w-xs whitespace-pre-wrap break-words text-white/70">{q.notes || '-'}</td>
                              <td className="py-2 pr-4 text-white/60 text-xs break-all">{q.ip || '-'}</td>
                              <td className="py-2 pr-4 text-white/60 text-xs break-words max-w-xs" title={q.userAgent}>{q.userAgent || '-'}</td>
                              <td className="py-2 pr-4">{statusBadge(q.status || 'new')}</td>
                              <td className="py-2 pr-4 text-white/70">{q.assignee || '-'}</td>
                              <td className="py-2 pr-4">
                                <RowActions
                                  quote={q}
                                  employees={employees}
                                  onDone={loadQuotes}
                                  onMessage={setQuoteMessage}
                                  canManage={canManageQuotes}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            ) : view === 'access' && canManageAccess ? (
              <section className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Total Accounts" value={accessStats.total} description={`${accessStats.active} active`} />
                  <StatCard label="Admins" value={accessStats.admins} description={`${accessStats.employees} team / ${accessStats.clients} clients`} />
                  <StatCard label="Suspended" value={accessStats.suspended} description="Awaiting re-activation" />
                  <StatCard
                    label="Last Change"
                    value={accessStats.lastUpdated ? formatDate(accessStats.lastUpdated) : '-'}
                    description={accessStats.lastUpdated ? 'Most recent update' : 'No changes recorded'}
                  />
                </div>

                <form onSubmit={handleSaveAccess} className="rounded-xl glass border border-glass p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {accessForm.id ? 'Update Access' : 'Grant Access'}
                    </h2>
                    {accessForm.id && (
                      <button type="button" onClick={resetAccessForm} className="text-sm text-white/70 hover:text-white">
                        Cancel edit
                      </button>
                    )}
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="accessEmail" className="block text-sm mb-1">
                        Google Email
                      </label>
                      <input
                        id="accessEmail"
                        name="email"
                        type="email"
                        value={accessForm.email}
                        onChange={handleAccessInputChange}
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="accessName" className="block text-sm mb-1">
                        Name (optional)
                      </label>
                      <input
                        id="accessName"
                        name="name"
                        value={accessForm.name}
                        onChange={handleAccessInputChange}
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="accessRole" className="block text-sm mb-1">
                        Role
                      </label>
                      <select
                        id="accessRole"
                        name="role"
                        value={accessForm.role}
                        onChange={handleAccessInputChange}
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      >
                        {accessRoleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="accessStatus" className="block text-sm mb-1">
                        Status
                      </label>
                      <select
                        id="accessStatus"
                        name="status"
                        value={accessForm.status}
                        onChange={handleAccessInputChange}
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      >
                        {accessStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="accessNotes" className="block text-sm mb-1">
                        Notes
                      </label>
                      <textarea
                        id="accessNotes"
                        name="notes"
                        rows={3}
                        value={accessForm.notes}
                        onChange={handleAccessInputChange}
                        className="w-full bg-white/5 border-white/15 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingAccess}
                      className="px-5 py-2 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50 disabled:opacity-60"
                    >
                      {savingAccess ? 'Saving…' : accessForm.id ? 'Save Changes' : 'Authorize Account'}
                    </button>
                    <button
                      type="button"
                      onClick={resetAccessForm}
                      className="text-sm text-white/70 hover:text-white"
                      disabled={savingAccess}
                    >
                      Reset
                    </button>
                  </div>
                  {accessMessage && (
                    <p className={`mt-3 text-sm ${accessMessage.type === 'error' ? 'text-red-400' : 'text-accent-blue'}`}>
                      {accessMessage.text}
                    </p>
                  )}
                </form>

                <div className="rounded-xl glass border border-glass p-6 space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-wrap gap-3 items-end">
                      <label className="text-sm">
                        <span className="block mb-1 text-white/70">Status</span>
                        <select
                          value={accessStatusFilter}
                          onChange={(e) => setAccessStatusFilter(e.target.value)}
                          className="bg-white/5 border-white/15 rounded px-3 py-2 text-sm"
                        >
                          <option value="all">All</option>
                          {accessStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="block mb-1 text-white/70">Role</span>
                        <select
                          value={accessRoleFilter}
                          onChange={(e) => setAccessRoleFilter(e.target.value)}
                          className="bg-white/5 border-white/15 rounded px-3 py-2 text-sm"
                        >
                          <option value="all">All</option>
                          {accessRoleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="block mb-1 text-white/70">Search</span>
                        <input
                          value={accessSearch}
                          onChange={(e) => setAccessSearch(e.target.value)}
                          placeholder="Email, name, notes…"
                          className="bg-white/5 border-white/15 rounded px-3 py-2 text-sm min-w-[220px]"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => loadAccessGrants()}
                        type="button"
                        className="px-4 py-2 text-sm rounded bg-white/5 border border-white/10 hover:border-accent-blue/50 disabled:opacity-60"
                        disabled={loadingAccessGrants}
                      >
                        Reload
                      </button>
                    </div>
                  </div>
                  {loadingAccessGrants && <p className="text-sm text-white/60">Loading authorized accounts…</p>}
                  {accessMessage && accessMessage.type === 'error' && (
                    <p className="text-sm text-red-400">{accessMessage.text}</p>
                  )}
                  {!loadingAccessGrants && filteredAccessGrants.length === 0 ? (
                    <p className="text-sm text-white/60">No accounts match the current filters.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="text-white/60">
                          <tr>
                            <th className="text-left py-2 pr-4">Email</th>
                            <th className="text-left py-2 pr-4">Name</th>
                            <th className="text-left py-2 pr-4">Role</th>
                            <th className="text-left py-2 pr-4">Status</th>
                            <th className="text-left py-2 pr-4">Last Seen</th>
                            <th className="text-left py-2 pr-4">Notes</th>
                            <th className="text-left py-2 pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAccessGrants.map((grant) => (
                            <tr key={grant.id || grant.email} className="border-t border-white/10">
                              <td className="py-2 pr-4 font-medium break-all">{grant.email}</td>
                              <td className="py-2 pr-4 text-white/70">{grant.name || '-'}</td>
                              <td className="py-2 pr-4 text-white/70 capitalize">{grant.role}</td>
                              <td className="py-2 pr-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                                    grant.status === 'active'
                                      ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                                      : 'border-accent-amber/40 bg-accent-amber/10 text-accent-amber'
                                  }`}
                                >
                                  {grant.status === 'active' ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-white/60 text-xs">
                                {grant.lastSeenAt ? formatDate(grant.lastSeenAt) : '-'}
                              </td>
                              <td className="py-2 pr-4 max-w-xs whitespace-pre-wrap break-words text-white/70">{grant.notes || '-'}</td>
                              <td className="py-2 pr-4">
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => startEditingAccess(grant)}
                                    disabled={updatingAccessId === grant.id || deletingAccessId === grant.id}
                                    className="px-2 py-1 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAccessStatus(grant, grant.status === 'active' ? 'suspended' : 'active')}
                                    disabled={updatingAccessId === grant.id || deletingAccessId === grant.id}
                                    className="px-2 py-1 rounded bg-white/10 border border-white/15 hover:border-accent-amber/50"
                                  >
                                    {grant.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAccess(grant.id)}
                                    disabled={deletingAccessId === grant.id || updatingAccessId === grant.id}
                                    className="px-2 py-1 rounded bg-white/10 border border-white/15 hover:border-red-400/60 disabled:opacity-60"
                                  >
                                    {deletingAccessId === grant.id ? 'Removing…' : 'Remove'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className="mt-8">
                <p className="text-sm text-white/60">
                  Access to this workspace is restricted for your account. Please contact an administrator for assistance.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function mapEmployeeRecord(row) {
  return {
    id: row.id,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    email: row.email || '',
    role: row.role || '',
    phone: row.phone || '',
    startDate: row.start_date || '',
    status: row.status || 'active',
    hourlyRate: row.hourly_rate === null || row.hourly_rate === undefined ? null : Number(row.hourly_rate),
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapAccessGrant(row = {}) {
  return {
    id: row.id || null,
    email: row.email || '',
    name: row.name || '',
    role: (row.role || 'client').toLowerCase(),
    status: (row.status || 'active').toLowerCase(),
    notes: row.notes || '',
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
    lastSeenAt: row.last_seen_at || row.lastSeenAt || null,
    lastSeenIp: row.last_seen_ip || row.lastSeenIp || ''
  }
}

function prepareEmployeePayload(form) {
  return {
    id: form.id || undefined,
    firstName: (form.firstName || '').trim(),
    lastName: (form.lastName || '').trim(),
    email: (form.email || '').trim(),
    role: (form.role || '').trim(),
    phone: (form.phone || '').trim(),
    startDate: form.startDate || '',
    status: form.status || 'active',
    hourlyRate: form.hourlyRate === null || form.hourlyRate === undefined ? '' : String(form.hourlyRate).trim(),
    notes: (form.notes || '').trim()
  }
}

function computeAccessStats(items = []) {
  if (!items.length) {
    return {
      total: 0,
      active: 0,
      suspended: 0,
      admins: 0,
      employees: 0,
      clients: 0,
      lastUpdated: null
    }
  }
  let active = 0
  let suspended = 0
  let admins = 0
  let employeesCount = 0
  let clientsCount = 0
  let lastUpdated = null
  items.forEach((item) => {
    const status = (item.status || 'active').toLowerCase()
    if (status === 'active') active += 1
    else suspended += 1
    const role = (item.role || 'client').toLowerCase()
    if (role === 'admin') admins += 1
    else if (role === 'employee') employeesCount += 1
    else clientsCount += 1
    const updated = parseISODate(item.updatedAt || item.updated_at)
    if (updated && (!lastUpdated || updated > lastUpdated)) {
      lastUpdated = updated
    }
  })
  return {
    total: items.length,
    active,
    suspended,
    admins,
    employees: employeesCount,
    clients: clientsCount,
    lastUpdated
  }
}

function computeEmployeeStats(items = []) {
  const total = items.length
  const active = items.filter((emp) => emp.status === 'active').length
  const onLeave = items.filter((emp) => emp.status === 'on_leave').length
  const former = items.filter((emp) => emp.status === 'former').length
  const starts = items
    .map((emp) => parseISODate(emp.startDate))
    .filter(Boolean)
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const avgTenureDays = starts.length
    ? starts.reduce((acc, date) => acc + (now - date.getTime()) / dayMs, 0) / starts.length
    : 0
  const avgTenureLabel = avgTenureDays > 0 ? formatTenureFromDays(avgTenureDays) : '-'
  const rates = items
    .map((emp) => Number(emp.hourlyRate))
    .filter((value) => Number.isFinite(value) && value > 0)
  const avgRate = rates.length ? rates.reduce((acc, value) => acc + value, 0) / rates.length : null
  const avgRateLabel = avgRate != null ? formatCurrency(avgRate) : '-'
  const newThisQuarter = starts.filter((date) => now - date.getTime() <= 90 * dayMs).length
  return {
    total,
    active,
    onLeave,
    former,
    avgTenureLabel,
    avgRateLabel,
    avgRate,
    newThisQuarter
  }
}

function computeRecentHires(items = []) {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  return items
    .map((emp) => {
      const start = parseISODate(emp.startDate)
      if (!start) return null
      const days = (now - start.getTime()) / dayMs
      if (days > 60) return null
      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        start,
        startLabel: formatDateShort(start)
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.start.getTime() - a.start.getTime())
}

function computeUpcomingAnniversaries(items = []) {
  const now = new Date()
  const horizon = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  return items
    .map((emp) => {
      const start = parseISODate(emp.startDate)
      if (!start) return null
      const next = nextAnniversary(start, now)
      if (next > horizon) return null
      const years = Math.max(1, next.getFullYear() - start.getFullYear())
      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        date: next,
        years
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((item) => ({
      id: item.id,
      name: item.name,
      label: `${formatDateShort(item.date)} - ${item.years} yr${item.years === 1 ? '' : 's'}`
    }))
}

function computeClientStats(items = []) {
  if (!items.length) {
    return {
      total: 0,
      newCount: 0,
      inProgress: 0,
      processed: 0,
      pending: 0,
      rushCount: 0,
      rushValueLabel: '$0.00',
      lastSubmissionLabel: '-',
      avgAgeLabel: 'Pipeline clear'
    }
  }
  let newCount = 0
  let inProgress = 0
  let processed = 0
  let rushCount = 0
  let rushValue = 0
  let lastSubmission = null
  let pendingAgeHours = 0
  let pendingCount = 0
  const now = Date.now()
  const hourMs = 60 * 60 * 1000
  items.forEach((item) => {
    const status = item.status || 'new'
    if (status === 'new') newCount += 1
    else if (status === 'in_progress') inProgress += 1
    else if (status === 'processed') processed += 1
    if (item.rush) rushCount += 1
    const fee = Number(item.amountRush)
    if (Number.isFinite(fee) && fee > 0) rushValue += fee
    const created = parseISODate(item.createdAt)
    if (created) {
      if (!lastSubmission || created > lastSubmission) lastSubmission = created
      if (status !== 'processed') {
        pendingAgeHours += (now - created.getTime()) / hourMs
        pendingCount += 1
      }
    }
  })
  const pending = items.length - processed
  const lastSubmissionLabel = lastSubmission ? formatDate(lastSubmission) : '-'
  const avgAgeLabel = pendingCount > 0 ? `Avg age ${formatHours(pendingAgeHours / pendingCount)}` : 'Pipeline clear'
  return {
    total: items.length,
    newCount,
    inProgress,
    processed,
    pending,
    rushCount,
    rushValue,
    rushValueLabel: rushValue > 0 ? formatCurrency(rushValue) : '$0.00',
    lastSubmissionLabel,
    avgAgeLabel
  }
}

function parseISODate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function nextAnniversary(start, now) {
  const candidate = new Date(now.getFullYear(), start.getMonth(), start.getDate())
  if (candidate < now) {
    return new Date(now.getFullYear() + 1, start.getMonth(), start.getDate())
  }
  return candidate
}

function formatTenure(startDate) {
  const start = parseISODate(startDate)
  if (!start) return '-'
  const now = new Date()
  const diffDays = (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  if (diffDays < 1) return 'New'
  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365)
    const months = Math.round((diffDays % 365) / 30)
    return months > 0 ? `${years}y ${months}m` : `${years}y`
  }
  if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30)
    const days = Math.round(diffDays % 30)
    return days > 0 ? `${months}m ${days}d` : `${months}m`
  }
  return `${Math.round(diffDays)}d`
}

function formatTenureFromDays(days) {
  if (!Number.isFinite(days) || days <= 0) return '-'
  if (days >= 365) {
    const years = days / 365
    return `${years >= 10 ? years.toFixed(0) : years.toFixed(1)} yrs`
  }
  if (days >= 30) {
    const months = days / 30
    return `${months >= 10 ? months.toFixed(0) : months.toFixed(1)} mo`
  }
  return `${Math.round(days)} days`
}

function formatDate(value) {
  try {
    const date = parseISODate(value)
    return date ? date.toLocaleString() : value
  } catch {
    return value
  }
}

function formatDateShort(value) {
  try {
    const date = parseISODate(value)
    return date ? date.toLocaleDateString() : value
  } catch {
    return value
  }
}

function formatCurrency(value) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  } catch {
    return `$${Number(value || 0).toFixed(2)}`
  }
}

function formatHours(hours) {
  if (!Number.isFinite(hours) || hours <= 0) return '0h'
  if (hours >= 24) {
    const days = hours / 24
    return `${days >= 5 ? days.toFixed(0) : days.toFixed(1)}d`
  }
  return `${hours >= 5 ? hours.toFixed(0) : hours.toFixed(1)}h`
}

function statusBadge(status) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs border'
  if (status === 'processed') {
    return <span className={`${base} border-white/10 bg-white/10 text-white/80`}>Processed</span>
  }
  if (status === 'in_progress') {
    return <span className={`${base} border-accent-blue/30 bg-accent-blue/10 text-accent-blue`}>In Progress</span>
  }
  return <span className={`${base} border-white/10 bg-white/5 text-white/80`}>New</span>
}

function isDueSoon(q) {
  try {
    const created = new Date(q.createdAt)
    const days = q.rush ? 5.5 : 7.5
    const due = new Date(created.getTime() + days * 24 * 60 * 60 * 1000)
    const left = due.getTime() - Date.now()
    return left < 48 * 60 * 60 * 1000 && (q.status || 'new') !== 'processed'
  } catch {
    return false
  }
}

function exportQuotesToCsv(items = []) {
  if (!items.length) return
  const headers = ['Created At', 'Name', 'Email', 'Project Type', 'Rush', 'Rush Fee', 'Notes', 'IP', 'User Agent', 'Status', 'Assignee']
  const rows = items.map((item) => [
    formatDate(item.createdAt),
    item.name,
    item.email,
    item.projectType,
    item.rush ? 'Yes' : 'No',
    item.amountRush,
    item.notes,
    item.ip,
    item.userAgent,
    item.status,
    item.assignee
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vetwraps-clients-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsv(value) {
  if (value === null || value === undefined) return ''
  const str = String(value).replace(/[\r\n]+/g, ' ')
  if (/[",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function RowActions({ quote, employees, onDone, onMessage, canManage = true }) {
  const [busy, setBusy] = React.useState(false)

  if (!canManage) {
    return <p className="text-xs text-white/50">View only</p>
  }

  async function update(payload) {
    onMessage?.(null)
    setBusy(true)
    try {
      const res = await authFetch('/api/quote-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, ...payload })
      })
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update quote')
      }
      onMessage?.({ type: 'success', text: 'Quote updated.' })
      await onDone()
    } catch (err) {
      onMessage?.({ type: 'error', text: err.message || 'Failed to update quote' })
    } finally {
      setBusy(false)
    }
  }

  function handleAssign(e) {
    update({ assignee: e.target.value })
  }

  return (
    <div className="space-y-2 text-xs">
      <select
        value={quote.assignee || ''}
        onChange={handleAssign}
        disabled={busy}
        className="w-full bg-white/5 border-white/15 rounded px-2 py-1"
      >
        <option value="">Unassigned</option>
        {employees.map((emp) => (
          <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`.trim()}>
            {emp.firstName} {emp.lastName}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update({ status: 'in_progress' })}
          disabled={busy || quote.status === 'in_progress'}
          className="px-2 py-1 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50 disabled:opacity-60"
        >
          In Progress
        </button>
        <button
          onClick={() => update({ status: 'processed', processedAt: true })}
          disabled={busy || quote.status === 'processed'}
          className="px-2 py-1 rounded bg-white/10 border border-white/15 hover:border-accent-amber/50 disabled:opacity-60"
        >
          Processed
        </button>
      </div>
    </div>
  )
}
function StatCard({ label, value, description }) {
  return (
    <div className="rounded-xl glass border border-glass p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {description ? <p className="mt-1 text-sm text-white/60">{description}</p> : null}
    </div>
  )
}
