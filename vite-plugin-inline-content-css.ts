import type { Plugin } from 'vite'

/** content.css를 content.js에 인라인 주입 (fetch 실패 시 대비) */
export function inlineContentCssPlugin(): Plugin {
  let contentCss: string | null = null

  return {
    name: 'inline-content-css',
    apply: 'build',
    generateBundle(_, bundle) {
      const cssKey = Object.keys(bundle).find((k) => k.includes('content') && k.endsWith('.css'))
      const cssAsset = cssKey ? bundle[cssKey] : null
      if (cssAsset && cssAsset.type === 'asset' && typeof cssAsset.source === 'string') {
        contentCss = cssAsset.source
      }

      const contentKey = Object.keys(bundle).find((k) => k.includes('content') && k.endsWith('.js'))
      const contentChunk = contentKey ? bundle[contentKey] : null
      if (contentChunk && contentChunk.type === 'chunk' && contentCss) {
        contentChunk.code = `var __DEVFLOAT_CSS__=${JSON.stringify(contentCss)};\n` + contentChunk.code
      }
    }
  }
}
