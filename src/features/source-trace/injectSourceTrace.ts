/** 소스 추적 스크립트를 페이지에 주입 (content script / React 컨텍스트에서 호출) */
const INJECTED_SCRIPT_ID = 'devfloat-injected-source-trace'

export function injectSourceTraceScript(): void {
  try {
    if (document.getElementById(INJECTED_SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = INJECTED_SCRIPT_ID
    script.src = chrome.runtime.getURL('assets/injected-source-trace.js')
    // script.remove() 하면 재주입 시 중복 리스너 발생 → 제거하지 않음
    ;(document.head ?? document.documentElement).appendChild(script)
  } catch {
    // 주입 실패해도 DevFloat 동작에 영향 없도록
  }
}

export function dispatchSourceTraceStop(): void {
  window.dispatchEvent(new CustomEvent('devfloat-source-trace-stop'))
}
