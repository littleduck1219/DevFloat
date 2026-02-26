/**
 * 페이지 컨텍스트에서 실행되는 스크립트
 */
import { getElementSourceLocation } from 'dom-element-to-component-source'

const MESSAGE_TYPE = 'DEVFLOAT_SOURCE_TRACE'

interface SourceLocation {
  file: string
  line: number
  column: number
  parent?: SourceLocation
}

function postToExtension(payload: unknown) {
  window.postMessage({ type: MESSAGE_TYPE, payload }, '*')
}

function isInsideDevFloat(el: Element): boolean {
  return (
    el.closest('#devfloat-extension-root') !== null ||
    el.closest('#devfloat-app-root') !== null ||
    el.closest('#devfloat-source-trace-overlay') !== null
  )
}

interface FiberNode {
  return: FiberNode | null
  _debugOwner?: FiberNode
  _debugSource?: { fileName: string; lineNumber: number; columnNumber?: number }
}

function getFiber(el: Element): FiberNode | null {
  const key = Object.keys(el).find(k => k.startsWith('__reactFiber$'))
  if (!key) return null
  return (el as unknown as Record<string, FiberNode>)[key] || null
}

function extractFileName(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] || path
}

function getSource(el: Element): SourceLocation | null {
  const chain: { file: string; line: number; column: number }[] = []
  const fiber = getFiber(el)
  if (!fiber) return null

  let current: FiberNode | null | undefined = fiber
  let depth = 0

  while (current && depth < 20) {
    depth++
    if (current._debugSource) {
      const src = current._debugSource
      const file = extractFileName(src.fileName)
      if (!chain.some(c => c.file === file)) {
        chain.push({ file, line: src.lineNumber, column: src.columnNumber || 0 })
      }
    }
    const owner = current._debugOwner
    const ret = current.return
    if (owner && ret && owner !== ret) {
      current = owner._debugSource ? owner : ret._debugSource ? ret : owner
    } else {
      current = owner || ret
    }
  }

  if (chain.length === 0) return null

  const deduped: typeof chain = []
  const seen = new Set<string>()
  for (const item of chain) {
    if (!seen.has(item.file)) {
      seen.add(item.file)
      deduped.push(item)
    }
  }
  deduped.reverse()

  const truncated = deduped.slice(-6)

  let result: SourceLocation | null = null
  for (const item of truncated) {
    const node: SourceLocation = { file: item.file, line: item.line, column: item.column }
    if (result) {
      let tail = result
      while (tail.parent) tail = tail.parent
      tail.parent = node
    } else {
      result = node
    }
  }
  return result
}

let handler: ((e: MouseEvent) => void) | null = null
let timeout: ReturnType<typeof setTimeout> | null = null
let errors = 0
let backoff = 0

function start() {
  if (handler) return
  handler = (e) => {
    const target = e.target as Element
    if (!target || isInsideDevFloat(target)) return
    if (Date.now() < backoff) return

    const { clientX, clientY } = e
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      const el = document.elementFromPoint(clientX, clientY) as Element
      if (!el || isInsideDevFloat(el)) return

      try {
        const result = getSource(el)
        if (result) {
          errors = 0
          postToExtension({ type: 'source', data: result })
        } else {
          getElementSourceLocation(el, { maxDepth: 10 })
            .then(r => {
              errors = 0
              if (r.success) postToExtension({ type: 'source', data: r.data })
              else postToExtension({ type: 'error', error: r.error })
            })
            .catch(err => {
              if (++errors >= 5) backoff = Date.now() + 3000
              postToExtension({ type: 'error', error: String(err) })
            })
        }
      } catch (err) {
        if (++errors >= 5) backoff = Date.now() + 3000
        postToExtension({ type: 'error', error: String(err) })
      }
    }, 300)
  }
  document.addEventListener('mouseover', handler, true)
}

function stop() {
  if (handler) {
    document.removeEventListener('mouseover', handler, true)
    handler = null
  }
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  errors = 0
  backoff = 0
  postToExtension({ type: 'clear' })
}

window.addEventListener('devfloat-source-trace-stop', stop)
start()
