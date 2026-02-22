import { useState } from 'react'
import { type HttpMethod } from '../store'

interface BodyEditorProps {
  method: HttpMethod
  body: string
  onChange: (body: string) => void
}

type BodyType = 'none' | 'json' | 'text' | 'form'

const METHODS_WITHOUT_BODY: readonly HttpMethod[] = ['GET', 'HEAD'] as const

const BODY_TYPE_TEMPLATES: Record<BodyType, string> = {
  none: '',
  json: '{\n  "key": "value"\n}',
  text: 'Raw text content',
  form: 'key1=value1&key2=value2'
} as const

export function BodyEditor({ method, body, onChange }: BodyEditorProps) {
  const [bodyType, setBodyType] = useState<BodyType>('json')
  
  const hasBody = !METHODS_WITHOUT_BODY.includes(method)

  function formatJson() {
    try {
      const parsed = JSON.parse(body)
      onChange(JSON.stringify(parsed, null, 2))
    } catch {
      // Invalid JSON, do nothing
    }
  }

  function handleBodyTypeChange(newType: BodyType) {
    setBodyType(newType)
    
    if (newType === 'none') {
      onChange('')
    } else if (!body.trim()) {
      onChange(BODY_TYPE_TEMPLATES[newType])
    }
  }

  function handleBodyTypeSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    handleBodyTypeChange(e.target.value as BodyType)
  }

  if (!hasBody) {
    return (
      <div className="body-editor body-editor--disabled">
        <div className="body-editor__title">Request Body</div>
        <div className="body-editor__note">
          {method} requests typically don't have a request body
        </div>
      </div>
    )
  }

  return (
    <div className="body-editor">
      <div className="body-editor__header">
        <div className="body-editor__title">Request Body</div>
        <div className="body-editor__controls">
          <label htmlFor="body-type-select" className="body-editor__type-label">
            Body Type
          </label>
          <select 
            id="body-type-select"
            value={bodyType}
            onChange={handleBodyTypeSelectChange}
            className="body-editor__type-select"
            aria-label="요청 본문 타입 선택"
          >
            <option value="none">None</option>
            <option value="json">JSON</option>
            <option value="text">Text</option>
            <option value="form">Form Data</option>
          </select>
          {bodyType === 'json' && (
            <button 
              type="button"
              onClick={formatJson}
              className="body-editor__format-btn"
              title="Format JSON"
              aria-label="JSON 포맷팅"
            >
              🎨
            </button>
          )}
        </div>
      </div>

      {bodyType !== 'none' && (
        <div className="body-editor__content">
          <label htmlFor="request-body-textarea" className="body-editor__textarea-label">
            Request Body Content
          </label>
          <textarea
            id="request-body-textarea"
            value={body}
            onChange={(e) => onChange(e.target.value)}
            placeholder={BODY_TYPE_TEMPLATES[bodyType]}
            className="body-editor__textarea"
            rows={8}
            spellCheck={false}
            aria-describedby="body-editor-help"
          />
          <div id="body-editor-help" className="body-editor__help">
            {bodyType === 'json' && 'JSON 형식으로 데이터를 입력하세요. 포맷 버튼으로 정리할 수 있습니다.'}
            {bodyType === 'text' && '일반 텍스트 데이터를 입력하세요.'}
            {bodyType === 'form' && 'key=value 형식으로 폼 데이터를 입력하세요.'}
          </div>
        </div>
      )}
    </div>
  )
}