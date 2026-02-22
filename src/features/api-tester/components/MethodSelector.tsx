import { type HttpMethod } from '../store'

interface MethodSelectorProps {
  method: HttpMethod
  onChange: (method: HttpMethod) => void
}

const HTTP_METHODS: readonly HttpMethod[] = [
  'GET', 
  'POST', 
  'PUT', 
  'DELETE', 
  'PATCH', 
  'HEAD', 
  'OPTIONS'
] as const

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'var(--success)',
  POST: 'var(--accent-primary)', 
  PUT: 'var(--warning)',
  DELETE: 'var(--error)',
  PATCH: 'var(--accent-secondary)',
  HEAD: 'var(--text-tertiary)',
  OPTIONS: 'var(--text-secondary)'
} as const

export function MethodSelector({ method, onChange }: MethodSelectorProps) {
  function handleMethodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange(e.target.value as HttpMethod)
  }

  return (
    <div className="method-selector">
      <label htmlFor="http-method-select" className="method-selector__label">
        HTTP Method
      </label>
      <select 
        id="http-method-select"
        value={method} 
        onChange={handleMethodChange}
        className="method-selector__select"
        style={{ color: METHOD_COLORS[method] }}
        aria-label="HTTP 메서드 선택"
      >
        {HTTP_METHODS.map((methodOption) => (
          <option 
            key={methodOption} 
            value={methodOption} 
            style={{ color: METHOD_COLORS[methodOption] }}
          >
            {methodOption}
          </option>
        ))}
      </select>
    </div>
  )
}