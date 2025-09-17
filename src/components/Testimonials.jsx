import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from './Reveal'

const data = [
  { quote: 'Disciplined, sharp, and on time. Our identity finally matches our ambition.', author: 'Operations Lead, Logistics Co.' },
  { quote: 'Clean and powerful visuals. They listened, iterated, and delivered.', author: 'Marketing Director, Esports Org' },
  { quote: 'Professional from day one. Streamlined and intentional execution.', author: 'Founder, Creator Studio' }
]

export default function Testimonials() {
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % data.length), 5000)
    return () => clearInterval(t)
  }, [])
  return (
    <Reveal as="section" aria-labelledby="testimonials-title" className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 id="testimonials-title" className="text-center text-2xl font-semibold">Testimonials</h2>
        <div className="mt-6 rounded-2xl glass border border-glass p-8 min-h-[180px] flex flex-col justify-between">
          <figure className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={data[i].quote}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="space-y-4"
              >
                <blockquote className="text-lg leading-relaxed">“{data[i].quote}”</blockquote>
                <figcaption className="text-sm text-white/70">— {data[i].author}</figcaption>
              </motion.div>
            </AnimatePresence>
          </figure>
          <div className="mt-6 flex justify-center gap-2">
            {data.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to testimonial ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${idx === i ? 'bg-accent-blue' : 'bg-white/20 hover:bg-white/40'}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  )
}

