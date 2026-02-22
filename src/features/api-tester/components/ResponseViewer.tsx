import { type ApiResponse, type ApiError } from '../store'

interface ResponseViewerProps {
  response: ApiResponse | null
  error: ApiError | null
  isLoading: boolean
}

export function ResponseViewer({ response, error, isLoading }: ResponseViewerProps) {
  if (isLoading) {
    return (
      <div className="response-viewer response-viewer--loading">
        <div className="response-viewer__title">Response</div>
        <div className="response-viewer__loading">
          <div className="response-viewer__spinner">⏳</div>
          <div>Sending request...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="response-viewer response-viewer--error">
        <div className="response-viewer__header">
          <div className="response-viewer__title">Response</div>
          <div className="response-viewer__meta">
            <span className="response-viewer__status response-viewer__status--error">
              Error
            </span>
            <span className="response-viewer__time">
              {error.responseTime}ms
            </span>
          </div>
        </div>
        <div className="response-viewer__error-content">
          <div className="response-viewer__error-icon">❌</div>
          <div className="response-viewer__error-message">
            <strong>{error.code || 'ERROR'}:</strong> {error.message}
          </div>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="response-viewer response-viewer--empty">
        <div className="response-viewer__title">Response</div>
        <div className="response-viewer__placeholder">
          Send a request to see the response here
        </div>
      </div>
    )
  }

  const getStatusColor = (status: number) => {
    if (status === 0) return 'var(--error)'
    if (status < 300) return 'var(--success)'
    if (status < 400) return 'var(--warning)'
    return 'var(--error)'
  }

  const formatResponseData = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return data
    }
  }

  const isJsonResponse = () => {
    try {
      JSON.parse(response.data)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="response-viewer">
      <div className="response-viewer__header">
        <div className="response-viewer__title">Response</div>
        <div className="response-viewer__meta">
          <span 
            className="response-viewer__status"
            style={{ color: getStatusColor(response.status) }}
          >
            {response.status === 0 ? 'Network Error' : `${response.status} ${response.statusText}`}
          </span>
          <span className="response-viewer__time">
            {response.responseTime}ms
          </span>
        </div>
      </div>

      <div className="response-viewer__tabs">
        <button className="response-viewer__tab response-viewer__tab--active">
          Body
        </button>
        <button className="response-viewer__tab">
          Headers ({Object.keys(response.headers).length})
        </button>
      </div>

      <div className="response-viewer__content">
        <div className="response-viewer__body">
          {response.data ? (
            <pre className="response-viewer__data">
              <code>
                {isJsonResponse() ? formatResponseData(response.data) : response.data}
              </code>
            </pre>
          ) : (
            <div className="response-viewer__empty-body">
              Empty response body
            </div>
          )}
        </div>
      </div>

      {Object.keys(response.headers).length > 0 && (
        <details className="response-viewer__headers-details">
          <summary>Response Headers ({Object.keys(response.headers).length})</summary>
          <div className="response-viewer__headers">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="response-viewer__header-item">
                <span className="response-viewer__header-key">{key}:</span>
                <span className="response-viewer__header-value">{value}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}