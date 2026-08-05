import { useEffect, useRef, useState } from 'react'

export function AdBanner({ atKey, width, height }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  // Auto-scale banner on small mobile screens to prevent overflow & zoom-out issues
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return
      const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth
      if (parentWidth < width) {
        setScale(parentWidth / width)
      } else {
        setScale(1)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [width])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const iframeContainer = container.querySelector('.ad-iframe-box')
    if (!iframeContainer) return
    iframeContainer.innerHTML = ''

    const iframe = document.createElement('iframe')
    iframe.width = width
    iframe.height = height
    iframe.style.border = 'none'
    iframe.style.overflow = 'hidden'
    iframe.scrolling = 'no'

    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>body { margin: 0; padding: 0; background: transparent; display: flex; justify-content: center; align-items: center; overflow: hidden; }</style></head>
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

    iframeContainer.appendChild(iframe)
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
        margin: '12px 0',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        minHeight: height * scale,
        height: height * scale
      }}
    >
      <div
        className="ad-iframe-box"
        style={{
          width: width,
          height: height,
          transform: scale < 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'center center',
          flexShrink: 0
        }}
      />
    </div>
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
        margin: '12px 0',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
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
