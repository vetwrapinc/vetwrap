import React from 'react'

export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-title" className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 id="testimonials-title" className="text-center text-2xl font-semibold">Testimonials</h2>
        <div className="mt-6 rounded-2xl glass border border-glass p-8">
          <p className="text-sm text-white/70 leading-relaxed">
            We publish testimonials only after clients have formally approved them for public use. As soon as we have permission,
            you&apos;ll see authentic feedback here. Until then, reach out through the quote form and we&apos;ll connect you directly with
            references who have opted in.
          </p>
          <div className="mt-6 text-center">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] bg-white/10 hover:bg-white/20 px-4 py-2 rounded border border-white/10"
            >
              Request a Quote
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
