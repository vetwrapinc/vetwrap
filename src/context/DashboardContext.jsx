import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { authFetch } from '../utils/api'

const storageKey = 'vetwraps.dashboard.v3'

const BASE_VALUES = {
  Logo: 620,
  'Brand Identity': 1550,
  'Social Pack': 920,
  Retainer: 1800
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
    avatarHue: 210,
    lastActivity: null
  },
  {
    id: 'emp-sasha',
    name: 'Sasha Patel',
    email: 'sasha@vetwraps.ops',
    specialty: 'Motion + Social Architect',
    assignments: [],
    balance: 0,
    lifetimeEarned: 0,
    avatarHue: 32,
    lastActivity: null
  },
  {
    id: 'emp-chris',
    name: 'Chris Holloway',
    email: 'chris@vetwraps.ops',
    specialty: 'AI Systems Liaison',
    assignments: [],
    balance: 0,
    lifetimeEarned: 0,
    avatarHue: 122,
    lastActivity: null
  }
]

const defaultClients = [
  {
    id: 'client-iron',
    name: 'Iron Grind Coffee',
    email: 'liaison@irongrind.cafe',
    company: 'Iron Grind Coffee',
    logoPreferences: 'Matte black badge with ember gradient typography',
    notes: 'Launch kit plus loyalty card redesign.',
    activeProjectId: 'quote-iron',
    lastUpdate: null,
    stage: 'in_progress',
    allowDownloads: false
  },
  {
    id: 'client-sentinel',
    name: 'Sentinel Systems',
    email: 'program@sentinelops.io',
    company: 'Sentinel Defense',
    logoPreferences: 'Angular insignia with deep navy and silver',
    notes: 'Command UI overhaul with secure asset library.',
    activeProjectId: 'quote-sentinel',
    lastUpdate: null,
    stage: 'assigned',
    allowDownloads: false
  }
]

const defaultPortfolio = [
  {
    id: 'portfolio-iron',
    title: 'Iron Grind Coffee Rollout',
    tag: 'Brand Systems',
    description: 'Brick and mortar launch assets, cup systems, and merch stack.',
    image: '/images/iron-grind-coffee.png',
    aspectRatio: 1200 / 794,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'portfolio-sentinel',
    title: 'Sentinel Defense Suite',
    tag: 'Interface Systems',
    description: 'Secure mission dashboards rendered for multi-device command.',
    image: '/images/sentinel-1200x800.png',
    aspectRatio: 1200 / 800,
    updatedAt: new Date().toISOString()
  }
]
function stageForStatus(status) {
  switch (status) {
    case 'assigned':
      return { label: 'Briefing and Research', percent: 22 }
    case 'in_progress':
      return { label: 'Design Execution', percent: 61 }
    case 'completed':
      return { label: 'Delivery and Debrief', percent: 100 }
    default:
      return { label: 'Intake Review', percent: 8 }
  }
}

function buildEta(status) {
  const baseDays = status === 'completed' ? 0 : status === 'assigned' ? 7 : status === 'in_progress' ? 3 : 10
  const eta = new Date()
  eta.setDate(eta.getDate() + baseDays)
  return eta.toISOString()
}

function createQuote(payload) {
  const id = payload.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `quote-${Date.now()}`)
  const status = payload.status || 'new'
  const stage = stageForStatus(status)
  const baseValue = BASE_VALUES[payload.projectType] || 950
  const rushFee = payload.rush ? 400 : 0
  const value = payload.value ?? baseValue + rushFee
  const commission = Number((value * 0.15).toFixed(2))

  return {
    id,
    clientId: payload.clientId || null,
    name: payload.name,
    email: payload.email,
    company: payload.company || '',
    logoPreferences: payload.logoPreferences || '',
    projectType: payload.projectType,
    rush: Boolean(payload.rush),
    notes: payload.notes || '',
    createdAt: payload.createdAt || new Date().toISOString(),
    status,
    stageLabel: payload.stageLabel || stage.label,
    progress: typeof payload.progress === 'number' ? payload.progress : stage.percent,
    value,
    commission,
    assignedTo: payload.assignedTo || null,
    assignedAt: payload.assignedAt || null,
    estimatedDelivery: payload.estimatedDelivery || buildEta(status),
    fileStatus: payload.fileStatus || 'Pending',
    previews: Array.isArray(payload.previews) ? payload.previews : [],
    finalAssets: Array.isArray(payload.finalAssets) ? payload.finalAssets : [],
    messages: Array.isArray(payload.messages) ? payload.messages : [],
    updates: Array.isArray(payload.updates) && payload.updates.length
      ? payload.updates
      : [
          {
            id: `${id}-update-${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: 'Request received and added to the mission queue.',
            status,
            authorRole: 'system'
          }
        ],
    lastUpdate: payload.lastUpdate || new Date().toISOString(),
    timeline: {
      initial: payload.timeline?.initial || payload.createdAt || new Date().toISOString(),
      revision: payload.timeline?.revision || null,
      final: payload.timeline?.final || null
    }
  }
}

const defaultQuotes = [
  createQuote({
    id: 'quote-iron',
    clientId: 'client-iron',
    name: 'Iron Grind Coffee',
    email: 'liaison@irongrind.cafe',
    company: 'Iron Grind Coffee',
    projectType: 'Brand Identity',
    status: 'in_progress',
    assignedTo: 'emp-morgan',
    assignedAt: new Date().toISOString(),
    logoPreferences: 'Matte black badge with ember gradient typography',
    notes: 'Suite includes loyalty cards, OOH menu, and launch graphics.',
    progress: 58,
    updates: [
      {
        id: 'quote-iron-kickoff',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        message: 'Kickoff deck shared with brand team. Awaiting color preference confirmation.',
        status: 'assigned',
        authorRole: 'admin'
      },
      {
        id: 'quote-iron-progress',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        message: 'Primary logo lockup drafted and queued for internal QA.',
        status: 'in_progress',
        authorRole: 'employee'
      }
    ]
  }),
  createQuote({
    id: 'quote-sentinel',
    clientId: 'client-sentinel',
    name: 'Sentinel Systems',
    email: 'program@sentinelops.io',
    company: 'Sentinel Defense',
    projectType: 'Social Pack',
    status: 'assigned',
    assignedTo: 'emp-sasha',
    assignedAt: new Date().toISOString(),
    logoPreferences: 'Angular insignia with deep navy and silver',
    notes: 'Command UI overhaul with secure asset library.',
    progress: 35,
    updates: [
      {
        id: 'quote-sentinel-intake',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        message: 'Admin coordinated data capture and uploaded telemetry references.',
        status: 'assigned',
        authorRole: 'admin'
      }
    ]
  })
]

const initialState = {
  employees: defaultEmployees,
  clients: defaultClients,
  quotes: defaultQuotes,
  averageTurnaround: '5-10 days',
  portfolio: defaultPortfolio
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
      employees: mergeEmployees(parsed.employees),
      clients: mergeClients(parsed.clients),
      quotes: mergeQuotes(parsed.quotes),
      portfolio: Array.isArray(parsed.portfolio) && parsed.portfolio.length ? parsed.portfolio : defaultPortfolio
    }
  } catch (error) {
    console.warn('Failed to load dashboard state:', error)
    return initialState
  }
}

function mergeEmployees(saved = []) {
  const map = new Map(defaultEmployees.map((emp) => [emp.id, emp]))
  saved.forEach((emp) => {
    if (!emp || !emp.id) return
    if (map.has(emp.id)) {
      map.set(emp.id, { ...map.get(emp.id), ...emp })
    } else {
      map.set(emp.id, emp)
    }
  })
  return Array.from(map.values())
}

function mergeClients(saved = []) {
  const map = new Map(defaultClients.map((client) => [client.id, client]))
  saved.forEach((client) => {
    if (!client || !client.id) return
    if (map.has(client.id)) {
      map.set(client.id, { ...map.get(client.id), ...client })
    } else {
      map.set(client.id, client)
    }
  })
  return Array.from(map.values())
}

function mergeQuotes(saved = []) {
  if (!Array.isArray(saved) || !saved.length) return defaultQuotes
  return saved.map((quote) =>
    createQuote({
      ...quote,
      updates: quote.updates,
      previews: quote.previews,
      finalAssets: quote.finalAssets,
      messages: quote.messages,
      timeline: quote.timeline
    })
  )
}
function reducer(state, action) {
  switch (action.type) {
    case 'REGISTER_QUOTE': {
      const incoming = Array.isArray(action.payload) ? action.payload : [action.payload]
      let quotes = state.quotes
      let clients = state.clients
      incoming.forEach((entry) => {
        if (!entry?.email || !entry?.projectType || !entry?.name) return
        const quote = createQuote(entry)
        const exists = quotes.some((item) => item.id === quote.id)
        quotes = exists ? quotes.map((item) => (item.id === quote.id ? { ...item, ...quote } : item)) : [quote, ...quotes]
        const lowerEmail = quote.email.toLowerCase()
        const clientMatch = clients.find((client) => client.email.toLowerCase() === lowerEmail)
        if (clientMatch) {
          clients = clients.map((client) =>
            client.id === clientMatch.id
              ? {
                  ...client,
                  activeProjectId: quote.id,
                  logoPreferences: quote.logoPreferences || client.logoPreferences,
                  lastUpdate: quote.lastUpdate,
                  stage: quote.status
                }
              : client
          )
        } else {
          clients = [
            {
              id: entry.clientId || `client-${Date.now()}`,
              name: quote.name,
              email: quote.email,
              company: quote.company || quote.name,
              logoPreferences: quote.logoPreferences || '',
              notes: quote.notes || '',
              activeProjectId: quote.id,
              lastUpdate: quote.lastUpdate,
              stage: quote.status,
              allowDownloads: false
            },
            ...clients
          ]
        }
      })
      return { ...state, quotes, clients }
    }
    case 'ASSIGN_QUOTE': {
      const { quoteId, employeeId, value } = action.payload
      const now = new Date().toISOString()
      const quotes = state.quotes.map((quote) => {
        if (quote.id !== quoteId) return quote
        const stage = stageForStatus('assigned')
        const nextValue = value || quote.value
        return {
          ...quote,
          assignedTo: employeeId,
          assignedAt: now,
          status: 'assigned',
          stageLabel: stage.label,
          progress: stage.percent,
          value: nextValue,
          commission: Number((nextValue * 0.15).toFixed(2)),
          lastUpdate: now,
          updates: [
            {
              id: `${quote.id}-assignment-${Date.now()}`,
              timestamp: now,
              message: 'Admin assigned a specialist to lead the mission.',
              status: 'assigned',
              authorRole: 'admin'
            },
            ...quote.updates
          ]
        }
      })
      const employees = state.employees.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              assignments: Array.from(new Set([quoteId, ...(emp.assignments || [])])),
              lastActivity: now
            }
          : emp
      )
      const clients = state.clients.map((client) =>
        client.activeProjectId === quoteId
          ? {
              ...client,
              stage: 'assigned',
              lastUpdate: now
            }
          : client
      )

      if (typeof window !== 'undefined' && quoteId) {
        ;(async () => {
          try {
            await authFetch('/api/quote-update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: quoteId, status: 'assigned', assignee: employeeId })
            })
          } catch (error) {
            console.warn('Unable to sync assignment to backend:', error)
          }
        })()
      }

      return { ...state, quotes, employees, clients }
    }
    case 'UPDATE_QUOTE_STATUS': {
      const { quoteId, status } = action.payload
      const now = new Date().toISOString()
      const stage = stageForStatus(status)
      const quotes = state.quotes.map((quote) => {
        if (quote.id !== quoteId) return quote
        const timeline = { ...quote.timeline }
        if (status === 'in_progress') timeline.revision = timeline.revision || now
        if (status === 'completed') timeline.final = now
        return {
          ...quote,
          status,
          stageLabel: stage.label,
          progress: stage.percent,
          estimatedDelivery: status === 'completed' ? now : buildEta(status),
          lastUpdate: now,
          timeline,
          updates: [
            {
              id: `${quote.id}-status-${Date.now()}`,
              timestamp: now,
              message: status === 'completed'
                ? 'Mission assets approved and delivered to the client library.'
                : 'Mission stage advanced from the control room.',
              status,
              authorRole: 'admin'
            },
            ...quote.updates
          ]
        }
      })
      const updatedQuote = quotes.find((quote) => quote.id === quoteId)
      const employees = state.employees.map((emp) => {
        if (emp.id !== updatedQuote?.assignedTo) return emp
        let balance = emp.balance
        let lifetimeEarned = emp.lifetimeEarned
        if (status === 'completed') {
          balance += updatedQuote?.commission || 0
          lifetimeEarned += updatedQuote?.commission || 0
        }
        return {
          ...emp,
          balance,
          lifetimeEarned,
          lastActivity: now
        }
      })
      const clients = state.clients.map((client) =>
        client.activeProjectId === quoteId
          ? {
              ...client,
              stage: status,
              lastUpdate: now,
              allowDownloads: status === 'completed' ? true : client.allowDownloads
            }
          : client
      )

      if (typeof window !== 'undefined' && quoteId) {
        ;(async () => {
          try {
            await authFetch('/api/quote-update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: quoteId,
                status,
                processedAt: status === 'completed' ? true : undefined
              })
            })
          } catch (error) {
            console.warn('Unable to sync status to backend:', error)
          }
        })()
      }

      return { ...state, quotes, employees, clients }
    }
    case 'CASH_OUT_EMPLOYEE': {
      const { employeeId } = action.payload
      const employees = state.employees.map((emp) =>
        emp.id === employeeId ? { ...emp, balance: 0, lastActivity: new Date().toISOString() } : emp
      )
      return { ...state, employees }
    }
    case 'ADD_MANUAL_UPDATE': {
      const { quoteId, message, status } = action.payload
      const now = new Date().toISOString()
      const quotes = state.quotes.map((quote) => {
        if (quote.id !== quoteId) return quote
        return {
          ...quote,
          lastUpdate: now,
          updates: [
            {
              id: `${quote.id}-manual-${Date.now()}`,
              timestamp: now,
              message,
              status: status || quote.status,
              authorRole: 'admin'
            },
            ...quote.updates
          ]
        }
      })
      const clients = state.clients.map((client) =>
        client.activeProjectId === quoteId ? { ...client, lastUpdate: now } : client
      )
      return { ...state, quotes, clients }
    }
    case 'UPSERT_PROJECT_PREVIEW': {
      const { quoteId, preview } = action.payload
      const quotes = state.quotes.map((quote) => {
        if (quote.id !== quoteId) return quote
        const previews = [preview, ...(quote.previews || [])].slice(0, 20)
        return {
          ...quote,
          previews,
          lastUpdate: preview.uploadedAt,
          updates: [
            {
              id: `${quote.id}-preview-${Date.now()}`,
              timestamp: preview.uploadedAt,
              message: `${preview.uploadedBy} shared a new preview tile for review.`,
              status: quote.status,
              authorRole: 'employee'
            },
            ...quote.updates
          ]
        }
      })
      return { ...state, quotes }
    }
    case 'ATTACH_FINAL_ASSET': {
      const { quoteId, asset } = action.payload
      const quotes = state.quotes.map((quote) =>
        quote.id === quoteId
          ? { ...quote, finalAssets: [asset, ...(quote.finalAssets || [])] }
          : quote
      )
      return { ...state, quotes }
    }
    case 'ADD_PROJECT_MESSAGE': {
      const { quoteId, message } = action.payload
      const now = new Date().toISOString()
      const quotes = state.quotes.map((quote) => {
        if (quote.id !== quoteId) return quote
        return {
          ...quote,
          messages: [
            {
              id: `${quote.id}-message-${Date.now()}`,
              timestamp: now,
              ...message
            },
            ...(quote.messages || [])
          ],
          updates: [
            {
              id: `${quote.id}-message-feed-${Date.now()}`,
              timestamp: now,
              message: message.body,
              status: quote.status,
              authorRole: message.authorRole
            },
            ...quote.updates
          ],
          lastUpdate: now
        }
      })
      return { ...state, quotes }
    }
    case 'UPDATE_PROJECT_TIMELINE': {
      const { quoteId, changes } = action.payload
      const quotes = state.quotes.map((quote) => {
        if (quote.id !== quoteId) return quote
        const nextValue = typeof changes?.value === 'number' ? changes.value : quote.value
        const nextCommission =
          typeof changes?.value === 'number' ? Number((changes.value * 0.15).toFixed(2)) : quote.commission
        return {
          ...quote,
          status: changes?.status || quote.status,
          stageLabel: changes?.stageLabel || quote.stageLabel,
          progress: typeof changes?.progress === 'number' ? changes.progress : quote.progress,
          estimatedDelivery: changes?.estimatedDelivery || quote.estimatedDelivery,
          fileStatus: changes?.fileStatus || quote.fileStatus,
          notes: typeof changes?.notes === 'string' ? changes.notes : quote.notes,
          value: nextValue,
          commission: nextCommission,
          lastUpdate: changes?.lastUpdate || quote.lastUpdate,
          timeline: {
            ...quote.timeline,
            ...(changes?.timeline || {})
          }
        }
      })
      return { ...state, quotes }
    }
    case 'ADD_CLIENT': {
      const client = {
        id: action.payload.id || `client-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        company: action.payload.company || action.payload.name,
        logoPreferences: action.payload.logoPreferences || '',
        notes: action.payload.notes || '',
        activeProjectId: action.payload.activeProjectId || null,
        lastUpdate: action.payload.lastUpdate || new Date().toISOString(),
        stage: action.payload.stage || 'new',
        allowDownloads: Boolean(action.payload.allowDownloads)
      }
      return { ...state, clients: [client, ...state.clients] }
    }
    case 'UPDATE_CLIENT': {
      const { id, changes } = action.payload
      const clients = state.clients.map((client) =>
        client.id === id ? { ...client, ...changes } : client
      )
      return { ...state, clients }
    }
    case 'DELETE_CLIENT': {
      const { id } = action.payload
      const clients = state.clients.filter((client) => client.id !== id)
      const quotes = state.quotes.map((quote) =>
        quote.clientId === id ? { ...quote, clientId: null } : quote
      )
      return { ...state, clients, quotes }
    }
    case 'ADD_EMPLOYEE': {
      const employee = {
        id: action.payload.id || `emp-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        specialty: action.payload.specialty || 'Designer',
        assignments: [],
        balance: 0,
        lifetimeEarned: 0,
        avatarHue: action.payload.avatarHue || Math.floor(Math.random() * 360),
        lastActivity: null
      }
      return { ...state, employees: [employee, ...state.employees] }
    }
    case 'UPDATE_EMPLOYEE': {
      const { id, changes } = action.payload
      const employees = state.employees.map((emp) =>
        emp.id === id ? { ...emp, ...changes } : emp
      )
      return { ...state, employees }
    }
    case 'REMOVE_EMPLOYEE': {
      const { id } = action.payload
      const employees = state.employees.filter((emp) => emp.id !== id)
      const quotes = state.quotes.map((quote) =>
        quote.assignedTo === id ? { ...quote, assignedTo: null } : quote
      )
      return { ...state, employees, quotes }
    }
    case 'UPDATE_AVERAGE_TURNAROUND': {
      return { ...state, averageTurnaround: action.payload }
    }
    case 'UPDATE_PORTFOLIO_ITEM': {
      const { id, changes } = action.payload
      const portfolio = state.portfolio.map((item) =>
        item.id === id
          ? { ...item, ...changes, updatedAt: new Date().toISOString() }
          : item
      )
      return { ...state, portfolio }
    }
    case 'ADD_PORTFOLIO_ITEM': {
      const item = {
        id: action.payload.id || `portfolio-${Date.now()}`,
        title: action.payload.title,
        tag: action.payload.tag || 'Showcase',
        description: action.payload.description || '',
        image: action.payload.image,
        aspectRatio: action.payload.aspectRatio || 1200 / 800,
        updatedAt: new Date().toISOString()
      }
      return { ...state, portfolio: [item, ...state.portfolio] }
    }
    case 'REMOVE_PORTFOLIO_ITEM': {
      const portfolio = state.portfolio.filter((item) => item.id !== action.payload)
      return { ...state, portfolio }
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
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.quotes)
          ? data.quotes
          : []
        if (items.length) {
          items.forEach((entry) => {
            dispatch({ type: 'REGISTER_QUOTE', payload: entry })
          })
        }
      } catch (error) {
        console.warn('Failed to hydrate dashboard state:', error)
      }
    }
    hydrateFromRemote()
    return () => {
      cancelled = true
    }
  }, [])

  const registerQuote = useCallback((payload) => {
    dispatch({ type: 'REGISTER_QUOTE', payload })
  }, [])

  const assignQuote = useCallback((payload) => {
    dispatch({ type: 'ASSIGN_QUOTE', payload })
  }, [])

  const updateQuoteStatus = useCallback((payload) => {
    dispatch({ type: 'UPDATE_QUOTE_STATUS', payload })
  }, [])

  const cashOutEmployee = useCallback((employeeId) => {
    dispatch({ type: 'CASH_OUT_EMPLOYEE', payload: { employeeId } })
  }, [])

  const addManualUpdate = useCallback((payload) => {
    dispatch({ type: 'ADD_MANUAL_UPDATE', payload })
  }, [])

  const upsertProjectPreview = useCallback((payload) => {
    dispatch({ type: 'UPSERT_PROJECT_PREVIEW', payload })
  }, [])

  const attachFinalAsset = useCallback((payload) => {
    dispatch({ type: 'ATTACH_FINAL_ASSET', payload })
  }, [])

  const addProjectMessage = useCallback((payload) => {
    dispatch({ type: 'ADD_PROJECT_MESSAGE', payload })
  }, [])

  const updateProjectTimeline = useCallback((payload) => {
    dispatch({ type: 'UPDATE_PROJECT_TIMELINE', payload })
  }, [])

  const addClient = useCallback((payload) => {
    dispatch({ type: 'ADD_CLIENT', payload })
  }, [])

  const updateClient = useCallback((payload) => {
    dispatch({ type: 'UPDATE_CLIENT', payload })
  }, [])

  const deleteClient = useCallback((payload) => {
    dispatch({ type: 'DELETE_CLIENT', payload })
  }, [])

  const addEmployee = useCallback((payload) => {
    dispatch({ type: 'ADD_EMPLOYEE', payload })
  }, [])

  const updateEmployee = useCallback((payload) => {
    dispatch({ type: 'UPDATE_EMPLOYEE', payload })
  }, [])

  const removeEmployee = useCallback((payload) => {
    dispatch({ type: 'REMOVE_EMPLOYEE', payload })
  }, [])

  const updateAverageTurnaround = useCallback((value) => {
    dispatch({ type: 'UPDATE_AVERAGE_TURNAROUND', payload: value })
  }, [])

  const updatePortfolioItem = useCallback((payload) => {
    dispatch({ type: 'UPDATE_PORTFOLIO_ITEM', payload })
  }, [])

  const addPortfolioItem = useCallback((payload) => {
    dispatch({ type: 'ADD_PORTFOLIO_ITEM', payload })
  }, [])

  const removePortfolioItem = useCallback((id) => {
    dispatch({ type: 'REMOVE_PORTFOLIO_ITEM', payload: id })
  }, [])

  const value = useMemo(
    () => ({
      state,
      registerQuote,
      assignQuote,
      updateQuoteStatus,
      cashOutEmployee,
      addManualUpdate,
      upsertProjectPreview,
      attachFinalAsset,
      addProjectMessage,
      updateProjectTimeline,
      addClient,
      updateClient,
      deleteClient,
      addEmployee,
      updateEmployee,
      removeEmployee,
      updateAverageTurnaround,
      updatePortfolioItem,
      addPortfolioItem,
      removePortfolioItem
    }),
    [
      state,
      registerQuote,
      assignQuote,
      updateQuoteStatus,
      cashOutEmployee,
      addManualUpdate,
      upsertProjectPreview,
      attachFinalAsset,
      addProjectMessage,
      updateProjectTimeline,
      addClient,
      updateClient,
      deleteClient,
      addEmployee,
      updateEmployee,
      removeEmployee,
      updateAverageTurnaround,
      updatePortfolioItem,
      addPortfolioItem,
      removePortfolioItem
    ]
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
