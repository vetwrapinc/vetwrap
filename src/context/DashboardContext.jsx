import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { authFetch } from '../utils/api'

const storageKey = 'vetwraps.dashboard.v1'

const BASE_VALUES = {
  'Logo': 620,
  'Brand Identity': 1550,
  'Social Pack': 920,
  'Retainer': 1800
}

const defaultEmployees = [
  {
    id: 'emp-morgan',
    name: 'Morgan Lee',
    email: 'morgan@vetwraps.ops',
    specialty: 'Brand Systems Strategist',
    assignments: [],
    balance: 0,
    lifetimeEarned: 0,
    avatarHue: 210
  },
  {
    id: 'emp-sasha',
    name: 'Sasha Patel',
    email: 'sasha@vetwraps.ops',
    specialty: 'Motion + Social Architect',
    assignments: [],
    balance: 0,
    lifetimeEarned: 0,
    avatarHue: 32
  },
  {
    id: 'emp-chris',
    name: 'Chris Holloway',
    email: 'chris@vetwraps.ops',
    specialty: 'AI Systems Liaison',
    assignments: [],
    balance: 0,
    lifetimeEarned: 0,
    avatarHue: 122
  }
]

const initialState = {
  employees: defaultEmployees,
  quotes: [],
  updates: []
}

function loadState() {
  if (typeof window === 'undefined') return initialState
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return initialState
    const parsed = JSON.parse(raw)
    return {
      ...initialState,
      ...parsed,
      employees: mergeEmployees(parsed.employees)
    }
  } catch (error) {
    console.warn('Failed to load dashboard state:', error)
    return initialState
  }
}

function mergeEmployees(savedEmployees = []) {
  const map = new Map(defaultEmployees.map((emp) => [emp.id, emp]))
  savedEmployees.forEach((emp) => {
    if (map.has(emp.id)) {
      map.set(emp.id, { ...map.get(emp.id), ...emp })
    } else {
      map.set(emp.id, emp)
    }
  })
  return Array.from(map.values())
}

function stageForStatus(status) {
  switch (status) {
    case 'assigned':
      return { label: 'Briefing & Research', percent: 20 }
    case 'in_progress':
      return { label: 'Design Execution', percent: 55 }
    case 'completed':
      return { label: 'Delivery & Debrief', percent: 100 }
    default:
      return { label: 'Intake Review', percent: 5 }
  }
}

function createQuote(payload) {
  const id = payload.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `quote-${Date.now()}`)
  const baseValue = BASE_VALUES[payload.projectType] || 950
  const totalValue = baseValue + (payload.rush ? 400 : 0)
  const commission = Number((totalValue * 0.15).toFixed(2))
  const { label, percent } = stageForStatus('new')
  return {
    id,
    name: payload.name,
    email: payload.email,
    projectType: payload.projectType,
    rush: Boolean(payload.rush),
    notes: payload.notes || '',
    createdAt: payload.createdAt || new Date().toISOString(),
    status: 'new',
    stageLabel: label,
    progress: percent,
    value: totalValue,
    commission,
    assignedTo: null,
    updates: [
      {
        id: `${id}-update-${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: 'Request received and added to the mission queue.',
        status: 'new'
      }
    ]
  }
}

function normalizeStatus(status) {
  if (!status) return 'new'
  const safe = String(status).toLowerCase()
  if (safe === 'processed' || safe === 'delivered') return 'completed'
  if (safe === 'in_progress' || safe === 'progress') return 'in_progress'
  if (safe === 'assigned') return 'assigned'
  if (safe === 'completed') return 'completed'
  return 'new'
}

function resolveEmployeeId(rawAssignee, employees = []) {
  if (!rawAssignee) return null
  const probe = String(rawAssignee).toLowerCase()
  const match = employees.find((emp) =>
    emp.email.toLowerCase() === probe || emp.name.toLowerCase() === probe
  )
  return match ? match.id : null
}

function adaptRemoteQuote(remote, employees) {
  if (!remote || !remote.id) return null
  const status = normalizeStatus(remote.status)
  const { label, percent } = stageForStatus(status)
  const baseValue = BASE_VALUES[remote.projectType] || 950
  const rushFee = remote.rush ? 400 : 0
  const remoteValue = typeof remote.amount === 'number' ? remote.amount : baseValue + rushFee
  const commission = Number((remoteValue * 0.15).toFixed(2))
  return {
    id: remote.id,
    name: remote.name || 'Client',
    email: remote.email || '',
    projectType: remote.projectType || 'Logo',
    rush: Boolean(remote.rush),
    notes: remote.notes || '',
    createdAt: remote.createdAt || new Date().toISOString(),
    status,
    stageLabel: label,
    progress: percent,
    value: remoteValue,
    commission,
    assignedTo: resolveEmployeeId(remote.assignee, employees),
    updates: [
      {
        id: `${remote.id}-remote-${Date.now()}`,
        timestamp: remote.updatedAt || remote.createdAt || new Date().toISOString(),
        message: remote.status_note || 'Imported from secure backend.',
        status
      }
    ]
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE_QUOTES': {
      const incoming = Array.isArray(action.payload) ? action.payload : []
      if (!incoming.length) return state
      const existingIds = new Set(state.quotes.map((quote) => quote.id))
      const additions = incoming
        .map((item) => adaptRemoteQuote(item, state.employees))
        .filter((quote) => quote && !existingIds.has(quote.id))
      if (!additions.length) return state
      return {
        ...state,
        quotes: [...state.quotes, ...additions]
      }
    }
    case 'REGISTER_QUOTE': {
      const quote = createQuote(action.payload)
      return {
        ...state,
        quotes: [quote, ...state.quotes],
        updates: [
          {
            id: `${quote.id}-log`,
            timestamp: quote.createdAt,
            summary: `${quote.name} requested ${quote.projectType}.`,
            quoteId: quote.id,
            type: 'intake'
          },
          ...state.updates
        ]
      }
    }
    case 'ASSIGN_QUOTE': {
      const { quoteId, employeeId, value } = action.payload
      const employees = state.employees.map((emp) => {
        if (emp.id !== employeeId) return emp
        const assignments = emp.assignments.some((item) => item.quoteId === quoteId)
          ? emp.assignments.map((item) =>
              item.quoteId === quoteId ? { ...item, status: 'assigned', value } : item
            )
          : [{ quoteId, status: 'assigned', value }, ...emp.assignments]
        return { ...emp, assignments }
      })
      const quotes = state.quotes.map((quote) => {
        if (quote.id !== quoteId) return quote
        const commission = Number((value * 0.15).toFixed(2))
        const { label, percent } = stageForStatus('assigned')
        return {
          ...quote,
          assignedTo: employeeId,
          status: 'assigned',
          value,
          commission,
          stageLabel: label,
          progress: percent,
          updates: [
            {
              id: `${quote.id}-assigned-${Date.now()}`,
              timestamp: new Date().toISOString(),
              message: 'Admin assigned the mission to a specialist and locked budget.',
              status: 'assigned'
            },
            ...quote.updates
          ]
        }
      })
      return {
        ...state,
        employees,
        quotes
      }
    }
    case 'UPDATE_QUOTE_STATUS': {
      const { quoteId, status } = action.payload
      const quotes = state.quotes.map((quote) => {
        if (quote.id !== quoteId) return quote
        const { label, percent } = stageForStatus(status)
        const entry = {
          id: `${quote.id}-${status}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: status === 'completed'
            ? 'Deliverables approved by client. Mission archived.'
            : status === 'in_progress'
            ? 'Designer synced with client mood board and entered build phase.'
            : 'Status updated.',
          status
        }
        return {
          ...quote,
          status,
          stageLabel: label,
          progress: percent,
          completedAt: status === 'completed' ? new Date().toISOString() : quote.completedAt,
          updates: [entry, ...quote.updates]
        }
      })

      let employees = state.employees
      const quote = quotes.find((item) => item.id === quoteId)
      if (quote?.assignedTo && status === 'completed') {
        employees = employees.map((emp) => {
          if (emp.id !== quote.assignedTo) return emp
          const updatedAssignments = emp.assignments.map((assignment) =>
            assignment.quoteId === quoteId ? { ...assignment, status: 'completed' } : assignment
          )
          return {
            ...emp,
            assignments: updatedAssignments,
            balance: Number((emp.balance + quote.commission).toFixed(2)),
            lifetimeEarned: Number((emp.lifetimeEarned + quote.commission).toFixed(2))
          }
        })
      }

      return {
        ...state,
        employees,
        quotes
      }
    }
    case 'CASH_OUT_EMPLOYEE': {
      const { employeeId } = action.payload
      const employees = state.employees.map((emp) =>
        emp.id === employeeId
          ? { ...emp, balance: 0 }
          : emp
      )
      return { ...state, employees }
    }
    case 'ADD_MANUAL_UPDATE': {
      const { quoteId, message, status } = action.payload
      const quotes = state.quotes.map((quote) => {
        if (quote.id !== quoteId) return quote
        return {
          ...quote,
          updates: [
            {
              id: `${quote.id}-manual-${Date.now()}`,
              timestamp: new Date().toISOString(),
              message,
              status: status || quote.status
            },
            ...quote.updates
          ]
        }
      })
      return { ...state, quotes }
    }
    default:
      return state
  }
}

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to persist dashboard state:', error)
    }
  }, [state])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false
    const hydrateFromRemote = async () => {
      try {
        const res = await authFetch('/api/quotes-list')
        if (!res?.ok) return
        const data = await res.json().catch(() => null)
        if (cancelled || !data) return
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.quotes) ? data.quotes : []
        if (items.length) {
          dispatch({ type: 'HYDRATE_QUOTES', payload: items })
        }
      } catch (error) {
        console.warn('Failed to hydrate dashboard state:', error)
      }
    }
    hydrateFromRemote()
    return () => { cancelled = true }
  }, [])

  const registerQuoteAction = useCallback((payload) => {
    dispatch({ type: 'REGISTER_QUOTE', payload })
  }, [])

  const assignQuoteAction = useCallback((payload) => {
    dispatch({ type: 'ASSIGN_QUOTE', payload })
    if (typeof window !== 'undefined' && payload.quoteId) {
      (async () => {
        try {
          await authFetch('/api/quote-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: payload.quoteId, status: 'assigned', assignee: payload.employeeId })
          })
        } catch (error) {
          console.warn('Unable to sync assignment to backend:', error)
        }
      })()
    }
  }, [])

  const updateQuoteStatusAction = useCallback((payload) => {
    dispatch({ type: 'UPDATE_QUOTE_STATUS', payload })
    if (typeof window !== 'undefined' && payload.quoteId) {
      (async () => {
        try {
          await authFetch('/api/quote-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: payload.quoteId,
              status: payload.status,
              processedAt: payload.status === 'completed' ? true : undefined
            })
          })
        } catch (error) {
          console.warn('Unable to sync status to backend:', error)
        }
      })()
    }
  }, [])

  const cashOutAction = useCallback((employeeId) => {
    dispatch({ type: 'CASH_OUT_EMPLOYEE', payload: { employeeId } })
  }, [])

  const addManualUpdateAction = useCallback((payload) => {
    dispatch({ type: 'ADD_MANUAL_UPDATE', payload })
  }, [])

  const value = useMemo(() => ({
    state,
    registerQuote: registerQuoteAction,
    assignQuote: assignQuoteAction,
    updateQuoteStatus: updateQuoteStatusAction,
    cashOutEmployee: cashOutAction,
    addManualUpdate: addManualUpdateAction
  }), [state, registerQuoteAction, assignQuoteAction, updateQuoteStatusAction, cashOutAction, addManualUpdateAction])

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
