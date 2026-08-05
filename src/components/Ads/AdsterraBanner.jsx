import { useEffect, useRef } from 'react'

export function AdBanner({ atKey, width, height }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''

    const iframe = document.createElement('iframe')
    iframe.width = width
    iframe.height = height
    iframe.style.border = 'none'
    iframe.style.overflow = 'hidden'
    iframe.scrolling = 'no'

    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>body { margin: 0; padding: 0; background: transparent; display: flex; justify-content: center; align-items: center; }</style></head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key': '${atKey}',
            'format': 'iframe',
            'height': ${height},
            'width': ${width},
            'params': {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${atKey}/invoke.js"></script>
      </body>
      </html>
    `

    container.appendChild(iframe)
    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(html)
    iframe.contentWindow.document.close()
  }, [atKey, width, height])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '16px 0',
        minHeight: height,
        width: '100%',
        overflow: 'hidden'
      }}
    />
  )
}

/**
 * Native Banner 4:1
 */
export function NativeAdBanner() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''

    const script = document.createElement('script')
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    script.src = 'https://pl30706324.effectivecpmnetwork.com/edbf82407ff6bc1270382eeac6307354/invoke.js'

    const div = document.createElement('div')
    div.id = 'container-edbf82407ff6bc1270382eeac6307354'

    container.appendChild(script)
    container.appendChild(div)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        margin: '16px 0',
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}
    />
  )
}

/**
 * Popunder Ad — ONLY for Videos section
 */
export function usePopunderAd() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://pl30706323.effectivecpmnetwork.com/30/78/f8/3078f820a7eb40dfc5cc7ab1a4fa7e6a.js'
    script.id = 'adsterra-popunder-script'
    document.body.appendChild(script)

    return () => {
      const existing = document.getElementById('adsterra-popunder-script')
      if (existing) existing.remove()
    }
  }, [])
}
