// 확장 프로그램 아이콘 클릭 시 content script에 토글 메시지 전송
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' }).catch(() => {
      // content script가 없으면 (설치 전 열린 탭 등) 먼저 주입 후 재시도
      chrome.scripting.executeScript({ target: { tabId: tab.id! }, files: ['assets/content.js'] })
        .then(() => chrome.tabs.sendMessage(tab.id!, { action: 'toggle' }))
        .catch(() => {})
    })
  }
})

// 설치/업데이트 시 이미 열려 있던 탭에도 content script 주입
chrome.runtime.onInstalled.addListener(async () => {
  const manifest = chrome.runtime.getManifest()
  const contentScripts = manifest.content_scripts ?? []
  const jsFiles = contentScripts.flatMap((cs) => (cs as { js?: string[] }).js ?? [])
  if (jsFiles.length === 0) return

  try {
    const tabs = await chrome.tabs.query({})
    for (const tab of tabs) {
      if (!tab.id || !tab.url) continue
      if (/^(chrome|chrome-extension|edge|about|devtools|view-source):\/\//i.test(tab.url)) continue
      if (tab.url.startsWith('chrome-extension://')) continue
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: jsFiles
        })
      } catch {
        // 제한된 페이지(일부 Google·은행 등)에서는 주입 불가
      }
    }
  } catch {
    // 권한 등 예외 시 무시
  }
})

// content script에서 메시지 받기
chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === 'toggle') {
    // 필요한 경우 추가 로직
  }
  sendResponse({ success: true })
})