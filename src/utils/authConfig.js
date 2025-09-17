export const ADMIN_ACCOUNT = {
  id: 'admin-ops',
  name: 'Operations Admin',
  email: 'vetwrapsinc@gmail.com',
  passwordHash: '$2b$10$8yxVy3UUFcdYa0Kvh3kkcurC3cL8Y2Yse61Zf/wNJQBWyTFJnu4re'
}

export const EMPLOYEE_ACCOUNTS = [
  {
    id: 'ava-hayes',
    name: 'Ava Hayes',
    title: 'Senior Account Lead',
    email: 'cabletomusic@gmail.com',
    focus: 'Franchise onboarding and launch playbooks',
    passwordHash: '$2b$10$aFlVl5O4NEXkA38GVFE6Rujcqle3yvJhT3S4zH327ocN6FSfUCvN6'
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
