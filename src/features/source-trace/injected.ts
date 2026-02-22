/**
 * 페이지 컨텍스트에서 실행되는 스크립트 (React Fiber 접근용)
 * content script가 script 태그로 주입
 */
import { getElementSourceLocation } from 'dom-element-to-component-source'

const MESSAGE_TYPE = 'DEVFLOAT_SOURCE_TRACE'

function postToExtension(payload: unknown) {
  window.postMessage({ type: MESSAGE_TYPE, payload }, '*')
}

function isInsideDevFloat(element: Element): boolean {
  return (
    element.closest('#devfloat-extension-root') !== null ||
    element.closest('#devfloat-app-root') !== null ||
    element.closest('#devfloat-source-trace-overlay') !== null
  )
}

let mouseoverHandler: ((e: MouseEvent) => void) | null = null
let hoverTimeout: ReturnType<typeof setTimeout> | null = null
const HOVER_DELAY_MS = 300
const BACKOFF_THRESHOLD = 5
const BACKOFF_MS = 3000
let consecutiveErrors = 0
let backoffUntil = 0

function start() {
  if (mouseoverHandler) return

  mouseoverHandler = (e: MouseEvent) => {
    const target = e.target as Element
    if (!target || isInsideDevFloat(target)) return
    if (Date.now() < backoffUntil) return

    const { clientX, clientY } = e
    if (hoverTimeout) clearTimeout(hoverTimeout)
    hoverTimeout = setTimeout(() => {
      hoverTimeout = null
      const el = document.elementFromPoint(clientX, clientY) as Element
      if (!el || isInsideDevFloat(el)) return

      getElementSourceLocation(el, { maxDepth: 10 })
        .then((result) => {
          consecutiveErrors = 0
          if (result.success) {
            postToExtension({ type: 'source', data: result.data })
          } else {
            postToExtension({ type: 'error', error: result.error })
          }
        })
        .catch((err) => {
          consecutiveErrors += 1
          if (consecutiveErrors >= BACKOFF_THRESHOLD) {
            backoffUntil = Date.now() + BACKOFF_MS
          }
          postToExtension({
            type: 'error',
            error: err instanceof Error ? err.message : String(err)
          })
        })
    }, HOVER_DELAY_MS)
  }

  document.addEventListener('mouseover', mouseoverHandler, true)
}

function stop() {
  if (mouseoverHandler) {
    document.removeEventListener('mouseover', mouseoverHandler, true)
    mouseoverHandler = null
  }
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  consecutiveErrors = 0
  backoffUntil = 0
  postToExtension({ type: 'clear' })
}

window.addEventListener('devfloat-source-trace-stop', stop)

// 스크립트 로드 시 자동 시작 (주입 시점에 이미 활성화된 상태)
start()
