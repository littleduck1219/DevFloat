export interface SourceLocation {
  file: string
  line: number
  column: number
  componentName?: string
  parent?: SourceLocation
}

export interface SourceTraceResult {
  success: true
  data: SourceLocation
}

export interface SourceTraceError {
  success: false
  error: string
}

export type SourceTraceResponse = SourceTraceResult | SourceTraceError

export function extractFileName(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const parts = normalized.split('/')
  return parts[parts.length - 1] ?? filePath
}

export interface FileChainItem {
  file: string
}

export function formatSourcePathAsFileNames<T extends FileChainItem>(location: T): string {
  const chain: string[] = []
  let current: T | undefined = location

  while (current) {
    chain.push(extractFileName(current.file))
    current = 'parent' in current ? (current.parent as T | undefined) : undefined
  }

  // injected.ts에서 이미 부모→자식 순서로 정렬됨
  // 최대 6개 컴포넌트로 제한
  const truncated = chain.slice(-6)

  return truncated.join(' › ')
}

export const DEV_MODE_ERROR_PATTERNS = [
  'development mode',
  'React Fiber',
  'debug source',
  'debugOwner'
] as const

export function isDevModeError(error: string): boolean {
  const lower = error.toLowerCase()
  return DEV_MODE_ERROR_PATTERNS.some((pattern) => lower.includes(pattern.toLowerCase()))
}
