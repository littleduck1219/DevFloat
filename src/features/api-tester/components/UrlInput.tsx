interface UrlInputProps {
  url: string
  onChange: (url: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export function UrlInput({ url, onChange, onSubmit, isLoading }: UrlInputProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !isLoading && url.trim()) {
      onSubmit()
    }
  }

  function handleSubmit() {
    if (!isLoading && url.trim()) {
      onSubmit()
    }
  }

  const isSubmitDisabled = isLoading || !url.trim()
  const submitButtonText = isLoading ? '요청 중...' : '전송'
  const submitButtonIcon = isLoading ? '⏳' : '▶️'

  return (
    <div className="url-input">
      <label htmlFor="api-url-input" className="url-input__label">
        API URL
      </label>
      <div className="url-input__container">
        <input
          id="api-url-input"
          type="url"
          placeholder="Enter URL (e.g., https://api.example.com/users)"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="url-input__field"
          disabled={isLoading}
          aria-describedby="url-input-help"
          autoComplete="url"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="url-input__send-btn"
          aria-label={submitButtonText}
          title={submitButtonText}
        >
          <span aria-hidden="true">{submitButtonIcon}</span>
          <span className="url-input__send-btn-text">{submitButtonText}</span>
        </button>
      </div>
      <div id="url-input-help" className="url-input__help">
        Enter 키를 눌러 요청을 전송할 수 있습니다
      </div>
    </div>
  )
}