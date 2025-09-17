export const ADMIN_ACCOUNT = {
  id: 'admin-ops',
  name: 'Operations Admin',
  email: 'operations@vetwraps.com',
  passwordHash: '$2b$10$raQmtlvSNPN7aU/mTmL5vuKhmboAKNrkFv1r8M1/sX.T/wYrQ92r6'
}

export const EMPLOYEE_ACCOUNTS = [
  {
    id: 'ava-hayes',
    name: 'Ava Hayes',
    title: 'Senior Account Lead',
    email: 'ava.hayes@vetwraps.com',
    focus: 'Franchise onboarding and launch playbooks',
    passwordHash: '$2b$10$6EASViIG4LFnUoDRG9fE3eGineyCmyM2jLZ2N3RodvYGUbrt125qa'
  },
  {
    id: 'marco-santos',
    name: 'Marco Santos',
    title: 'Client Success Strategist',
    email: 'marco.santos@vetwraps.com',
    focus: 'Retention programs and lifecycle campaigns',
    passwordHash: '$2b$10$6uJumjX4bWufDvd05mXmR.tCKLtGE3ee0gAudNDryYO73HJ7vUCle'
  }
]

export const CLIENT_ACCOUNTS = [
  {
    id: 'luna-martinez',
    name: 'Luna Martinez',
    organization: 'Paws & Co. Veterinary Group',
    email: 'luna.martinez@pawsco.com',
    petFocus: 'Multi-location expansion support',
    passwordHash: '$2b$10$.TG1sXKDyqtKQy.jxVmD5OcBZX8NIYS1qvOtyjI8/dlYATcJgb5mO'
  },
  {
    id: 'eric-cho',
    name: 'Eric Cho',
    organization: 'Downtown Animal Clinic',
    email: 'eric.cho@daclinic.com',
    petFocus: 'Wellness plan launch and email automation',
    passwordHash: '$2b$10$ZIVBpkq4GKKntuotQ0tZaOm06TC6qhbHTWUZOlvI9eUcn.iZF1XQy'
  },
  {
    id: 'sasha-patel',
    name: 'Sasha Patel',
    organization: 'GreenTail Mobile Vet',
    email: 'sasha.patel@greentail.com',
    petFocus: 'Mobile visit onboarding and SMS playbooks',
    passwordHash: '$2b$10$m1VSsDzZlfB.ZwqxxK8yMOAvCb/QTkSX6PSoYoBmeP5lh/AybtiV.'
  }
]

export function findAccountByEmail(role, email) {
  if (!email) return null
  const normalized = email.trim().toLowerCase()
  if (role === 'admin') {
    return ADMIN_ACCOUNT.email === normalized ? ADMIN_ACCOUNT : null
  }
  if (role === 'employee') {
    return EMPLOYEE_ACCOUNTS.find((account) => account.email === normalized) || null
  }
  if (role === 'client') {
    return CLIENT_ACCOUNTS.find((account) => account.email === normalized) || null
  }
  return null
}

export const DEMO_CREDENTIALS = {
  admin: { email: ADMIN_ACCOUNT.email, password: 'WrapAdmin!24' },
  employee: [
    { email: EMPLOYEE_ACCOUNTS[0].email, password: 'TeamVet123' },
    { email: EMPLOYEE_ACCOUNTS[1].email, password: 'CareCrew#9' }
  ],
  client: [
    { email: CLIENT_ACCOUNTS[0].email, password: 'TailWag#7' },
    { email: CLIENT_ACCOUNTS[1].email, password: 'Pawsitive@2' },
    { email: CLIENT_ACCOUNTS[2].email, password: 'PetParent!1' }
  ]
}
