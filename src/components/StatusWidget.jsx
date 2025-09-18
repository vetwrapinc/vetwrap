import React from 'react'

export default function StatusWidget({ className = '' }) {
  const avg = import.meta.env.VITE_AVG_TURNAROUND || '5-10 days'

  return (
    <div className={`${className} w-full`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-3 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-md px-4 py-3 text-xs sm:text-sm text-white/80 flex flex-wrap items-center justify-center gap-3 shadow-[0_8px_30px_rgba(10,10,18,0.25)]">
          <span className="uppercase tracking-[0.25em] text-white/60">Current average turnaround</span>
          <span className="font-semibold text-white">{avg}</span>
        </div>
      </div>
    </div>
  )
}
