import { useEffect } from 'react'
import { useSourceTraceStore } from './store'
import { injectSourceTraceScript, dispatchSourceTraceStop } from './injectSourceTrace'
import { formatSourcePathAsFileNames, type SourceLocation } from '../../utils'
import './source-trace.scss'

export function SourceTracePanel() {
  const { sourcePath, error, isActive, setActive } = useSourceTraceStore()

  useEffect(() => {
    if (isActive) {
      injectSourceTraceScript()
    } else {
      dispatchSourceTraceStop()
    }
  }, [isActive])

  const hintText = isActive
    ? '페이지 요소에 마우스를 올려 보세요. 브라우저 왼쪽 상단에 소스 경로가 표시됩니다.'
    : '활성화하면 요소 호버 시 왼쪽 상단에 소스 경로(파일명)가 표시됩니다. (React 개발 모드 필요)'

  return (
    <div className="source-trace">
      <div className="source-trace__header">
        <label className="source-trace__toggle">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span>소스 추적 활성화</span>
        </label>
        <p className="source-trace__hint">{hintText}</p>
      </div>

      {error && <div className="source-trace__error">{error}</div>}

      {sourcePath && !error && (
        <div className="source-trace__result">
          <div className="source-trace__path">
            {formatSourcePathAsFileNames(sourcePath as SourceLocation)}
          </div>
        </div>
      )}

      {!sourcePath && !error && isActive && (
        <div className="source-trace__empty">
          요소를 호버하면 브라우저 왼쪽 상단에 소스 경로가 표시됩니다
        </div>
      )}
    </div>
  )
}
