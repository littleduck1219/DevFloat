import { useApiStore } from './store'
import { MethodSelector } from './components/MethodSelector'
import { UrlInput } from './components/UrlInput'
import { HeaderEditor } from './components/HeaderEditor'
import { BodyEditor } from './components/BodyEditor'
import { ResponseViewer } from './components/ResponseViewer'
import './api-tester.scss'

export function ApiTester() {
  const {
    request,
    response,
    error,
    isLoading,
    setRequest,
    executeRequest,
    addHeader,
    removeHeader,
    updateHeader
  } = useApiStore()

  return (
    <div className="api-tester">
      <div className="api-tester__request">
        <div className="api-tester__url-section">
          <MethodSelector
            method={request.method}
            onChange={(method) => setRequest({ method })}
          />
          <UrlInput
            url={request.url}
            onChange={(url) => setRequest({ url })}
            onSubmit={executeRequest}
            isLoading={isLoading}
          />
        </div>

        <div className="api-tester__tabs">
          <HeaderEditor
            headers={request.headers}
            onAdd={addHeader}
            onUpdate={updateHeader}
            onRemove={removeHeader}
          />
          
          <BodyEditor
            method={request.method}
            body={request.body}
            onChange={(body) => setRequest({ body })}
          />
        </div>
      </div>

      <div className="api-tester__response">
        <ResponseViewer
          response={response}
          error={error}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}