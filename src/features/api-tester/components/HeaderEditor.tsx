import { useState } from 'react'

interface HeaderEditorProps {
  headers: Record<string, string>
  onAdd: (key: string, value: string) => void
  onUpdate: (key: string, value: string) => void
  onRemove: (key: string) => void
}

const COMMON_HEADERS = [
  'Content-Type',
  'Authorization',
  'Accept',
  'User-Agent',
  'Cache-Control'
] as const

export function HeaderEditor({ headers, onAdd, onUpdate, onRemove }: HeaderEditorProps) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  function handleAdd() {
    const trimmedKey = newKey.trim()
    const trimmedValue = newValue.trim()
    
    if (trimmedKey && trimmedValue) {
      onAdd(trimmedKey, trimmedValue)
      setNewKey('')
      setNewValue('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  function handleHeaderKeyChange(oldKey: string, newKey: string, value: string) {
    if (newKey === oldKey) return
    
    onRemove(oldKey)
    if (newKey.trim()) {
      onAdd(newKey, value)
    }
  }

  return (
    <div className="header-editor">
      <div className="header-editor__title">Headers</div>
      
      <div className="header-editor__list">
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="header-editor__item">
            <input
              type="text"
              value={key}
              onChange={(e) => handleHeaderKeyChange(key, e.target.value, value)}
              className="header-editor__key"
              placeholder="Header name"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onUpdate(key, e.target.value)}
              className="header-editor__value"
              placeholder="Header value"
            />
            <button
              onClick={() => onRemove(key)}
              className="header-editor__remove"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      <div className="header-editor__add">
        <select
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="header-editor__key-select"
        >
          <option value="">Select header or type custom</option>
          {COMMON_HEADERS.map(header => (
            <option key={header} value={header}>{header}</option>
          ))}
        </select>
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Header name"
          className="header-editor__key-input"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Header value"
          className="header-editor__value-input"
        />
        <button
          onClick={handleAdd}
          disabled={!newKey.trim() || !newValue.trim()}
          className="header-editor__add-btn"
        >
          ➕
        </button>
      </div>
    </div>
  )
}