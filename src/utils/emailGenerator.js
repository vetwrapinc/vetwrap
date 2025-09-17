const TONE_TEMPLATES = {
  warm: {
    opener: (recipient) => `I hope your week is going well, ${recipient}.`,
    signOff: (sender) => `Warmly,\n${sender}`
  },
  professional: {
    opener: (recipient) => `Thank you for the continued partnership, ${recipient}.`,
    signOff: (sender) => `Best regards,\n${sender}`
  },
  energetic: {
    opener: (recipient) => `We are energized by the momentum you are building, ${recipient}!`,
    signOff: (sender) => `Let’s keep the pace,\n${sender}`
  }
}

export function generateEmailDraft({
  tone = 'warm',
  senderName,
  recipientName,
  serviceFocus,
  assignmentSummary,
  nextMilestone,
  additionalNotes
}) {
  const template = TONE_TEMPLATES[tone] || TONE_TEMPLATES.warm
  const safeRecipient = recipientName || 'there'
  const safeSender = senderName || 'The VetWraps Digital Design Team'
  const focusLine = serviceFocus ? `We’re concentrating on ${serviceFocus.toLowerCase()} to keep your brand experience seamless.` : ''
  const summaryLine = assignmentSummary ? `${assignmentSummary.trim().replace(/\.$/, '')}.` : ''
  const milestoneLine = nextMilestone ? `Our next milestone is ${nextMilestone}.` : ''
  const notesLine = additionalNotes ? `Here’s a quick custom note from the team: ${additionalNotes.trim()}` : ''

  const body = [
    `Hi ${safeRecipient},`,
    '',
    template.opener(safeRecipient),
    focusLine,
    summaryLine,
    milestoneLine,
    notesLine,
    '',
    template.signOff(safeSender)
  ]
    .filter(Boolean)
    .join('\n')

  const subjectFocus = serviceFocus ? serviceFocus : 'Account Update'
  const subject = `${subjectFocus} • VetWraps Digital Design`

  return { subject, body }
}
