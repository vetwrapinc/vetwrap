export function loadRecaptcha(siteKey) {
  if (!siteKey) return Promise.resolve(null)
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha)
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    s.async = true
    s.defer = true
    s.onload = () => resolve(window.grecaptcha)
    s.onerror = () => reject(new Error('Failed to load reCAPTCHA'))
    document.head.appendChild(s)
  })
}

export async function mountRecaptcha(containerId, siteKey, options = {}) {
  const grecaptcha = await loadRecaptcha(siteKey)
  if (!grecaptcha) return null
  const opts = {
    sitekey: siteKey,
    theme: options.theme || 'dark',
    size: options.size || 'normal'
  }
  return grecaptcha.render(containerId, opts)
}
