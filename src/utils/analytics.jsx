import React from 'react'

export function Analytics() {
  const gaId = import.meta.env.VITE_GA_ID
  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
  return (
    <>
      {gaId ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');` }} />
        </>
      ) : null}
      {plausibleDomain ? (
        <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js"></script>
      ) : null}
    </>
  )
}

