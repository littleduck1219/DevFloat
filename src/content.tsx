import { createRoot } from 'react-dom/client'
import App from './App'
import './index.scss'
import { formatSourcePathAsFileNames, isDevModeError, type SourceLocation } from './utils'
import { useSourceTraceStore } from './features/source-trace/store'
import { useFloatingStore } from './store/floatingStore'

declare const __DEVFLOAT_CSS__: string | undefined

const MESSAGE_TYPE = 'DEVFLOAT_SOURCE_TRACE'

function setupSourceTraceMessaging(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.source !== window || event.data?.type !== MESSAGE_TYPE) return

    const { payload } = event.data
    if (!payload) return

    const { setSourcePath, setError, setActive } = useSourceTraceStore.getState()

    switch (payload.type) {
      case 'source':
        setSourcePath(payload.data)
        break
      case 'error':
        if (isDevModeError(payload.error)) {
          setActive(false)
        }
        setError(payload.error)
        break
      case 'clear':
        setSourcePath(null)
        setError(null)
        break
    }
  })
}

function setupSourceTraceOverlay(): void {
  if (document.getElementById('devfloat-source-trace-overlay')) return

  const overlay = document.createElement('div')
  overlay.id = 'devfloat-source-trace-overlay'
  overlay.style.cssText = `
    position: fixed !important;
    top: 12px !important;
    left: 12px !important;
    padding: 10px 14px !important;
    background: rgba(15, 15, 15, 0.92) !important;
    color: #e5e5e5 !important;
    font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
    border-radius: 8px !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    pointer-events: none !important;
    z-index: 2147483647 !important;
    display: none;
    isolation: isolate !important;
  `
  document.body.appendChild(overlay)

  useSourceTraceStore.subscribe((state) => {
    const { sourcePath, isActive } = state
    if (isActive && sourcePath) {
      overlay.textContent = formatSourcePathAsFileNames(sourcePath as SourceLocation)
      overlay.style.display = 'block'
    } else {
      overlay.style.display = 'none'
    }
  })
}

setupSourceTraceMessaging()

if (!document.getElementById('devfloat-app-root')) {
  const initExtension = async (): Promise<void> => {
    const zIndex = 999999

    const appRoot = document.createElement('div')
    appRoot.id = 'devfloat-app-root'

    const savedPosition = useFloatingStore.getState().position
    appRoot.style.cssText = `
      position: fixed;
      top: ${savedPosition.top}px;
      left: ${savedPosition.left}px;
      right: ${savedPosition.left === 0 ? '20px' : 'auto'};
      width: 800px;
      height: 600px;
      min-width: 400px;
      min-height: 300px;
      pointer-events: auto;
      z-index: ${zIndex};
    `

    const shadowRoot = appRoot.attachShadow({ mode: 'closed' })

    const styleEl = document.createElement('style')
    styleEl.textContent = '* { box-sizing: border-box; }'
    shadowRoot.appendChild(styleEl)

    let cssText: string
    if (typeof __DEVFLOAT_CSS__ === 'string' && __DEVFLOAT_CSS__) {
      cssText = __DEVFLOAT_CSS__
    } else {
      try {
        const cssUrl = chrome.runtime.getURL('assets/content.css')
        const res = await fetch(cssUrl)
        cssText = await res.text()
      } catch {
        cssText = ''
      }
    }

    if (cssText) {
      const appStyle = document.createElement('style')
      appStyle.textContent = cssText
      shadowRoot.appendChild(appStyle)
    } else {
      const fallback = document.createElement('style')
      fallback.textContent = `
        :host{--bg-primary:#1f2937;--bg-secondary:#374151;--text-primary:#f9fafb;--text-secondary:#d1d5db;--text-tertiary:#9ca3af;--border-primary:#4b5563;--accent-primary:#60a5fa;--radius-md:6px;--radius-xl:8px;--bg-tertiary:#374151;--error:#f87171}
        .app{position:absolute;inset:0;display:flex;flex-direction:column;border-radius:var(--radius-xl);overflow:hidden;border:1px solid var(--border-primary);background:var(--bg-primary);color:var(--text-primary);font-family:system-ui,sans-serif}
        .floating-header{background:var(--bg-secondary);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-primary)}
        .floating-header__btn{background:none;border:none;color:var(--text-secondary);cursor:pointer;padding:4px}
        .app__tabs,.app__main,.container--api-tester,.container--source-trace,.source-trace{display:flex;flex-direction:column;gap:1rem;flex:1;min-height:0;padding:1rem}
        .source-trace__header{display:flex;flex-direction:column;gap:.5rem}
        .source-trace__toggle{display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.875rem;font-weight:500;color:var(--text-primary)}
        .source-trace__toggle input{cursor:pointer;width:1rem;height:1rem;accent-color:var(--accent-primary)}
        .source-trace__hint{font-size:.75rem;color:var(--text-secondary);line-height:1.4}
        .source-trace__result,.source-trace__path{padding:.75rem 1rem;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:var(--radius-md);font-size:.8125rem;font-family:ui-monospace,monospace;color:var(--text-primary)}
        .source-trace__error{padding:.75rem 1rem;background:rgba(248,113,113,.15);border:1px solid rgba(248,113,113,.4);border-radius:var(--radius-md);color:var(--error)}
      `
      shadowRoot.appendChild(fallback)
    }

    const appContainer = document.createElement('div')
    appContainer.className = 'devfloat-root'
    shadowRoot.appendChild(appContainer)
    document.body.appendChild(appRoot)

    const bringToFront = (): void => {
      appRoot.style.zIndex = String(zIndex)
    }
    appRoot.addEventListener('mousedown', bringToFront)

    useFloatingStore.subscribe((state) => {
      appRoot.style.pointerEvents = state.isVisible ? 'auto' : 'none'
      appRoot.style.visibility = state.isVisible ? 'visible' : 'hidden'
    })
    appRoot.style.pointerEvents = useFloatingStore.getState().isVisible ? 'auto' : 'none'
    appRoot.style.visibility = useFloatingStore.getState().isVisible ? 'visible' : 'hidden'

    setupSourceTraceOverlay()

    const root = createRoot(appContainer)
    root.render(<App />)

    ;(window as unknown as { toggleDevFloat: () => void }).toggleDevFloat = () => {
      const event = new CustomEvent('devfloat-toggle')
      window.dispatchEvent(event)
    }

    chrome.runtime.onMessage.addListener(
      (request: { action?: string }, _sender, sendResponse: (response?: unknown) => void) => {
        if (request.action === 'toggle') {
          const event = new CustomEvent('devfloat-toggle')
          window.dispatchEvent(event)
        }
        sendResponse({ success: true })
        return true
      }
    )
  }

  initExtension()
}
