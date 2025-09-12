import React from 'react'

export default function StatusWidget({ className = '' }) {
  const avg = import.meta.env.VITE_AVG_TURNAROUND || '3–5 days'
  return (
    <div className={`${className} w-full`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2 text-center text-xs text-white/80">
          <span className="uppercase tracking-[0.2em] text-white/60">Current average turnaround:</span> <span className="text-white font-medium">{avg}</span>
        </div>
      </div>
    </div>
  )
}

