import { useCallback } from 'react'
import { useFloatingStore } from '../store/floatingStore'
import { useDraggable } from '../hooks/useDraggable'

interface FloatingHeaderProps {
  onMinimize: () => void
  onClose: () => void
}

const APP_ROOT_ID = 'devfloat-app-root'

export function FloatingHeader({ onMinimize, onClose }: FloatingHeaderProps) {
  const { isMinimized, toggleMinimized, setPosition } = useFloatingStore()

  const handleDragEnd = useCallback(
    (position: { top: number; left: number }) => {
      setPosition(position)
    },
    [setPosition]
  )

  const { isDragging, handleMouseDown } = useDraggable({
    targetId: APP_ROOT_ID,
    onDragEnd: handleDragEnd
  })

  const handleMinimizeClick = useCallback(() => {
    toggleMinimized()
    if (!isMinimized) {
      onMinimize()
    }
  }, [isMinimized, onMinimize, toggleMinimized])

  return (
    <div
      className="floating-header"
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
      <div className="floating-header__title">🔧 DevFloat</div>

      <div className="floating-header__controls">
        <button
          className="floating-header__btn floating-header__btn--minimize"
          onClick={handleMinimizeClick}
          title={isMinimized ? '최대화' : '최소화'}
          aria-label={isMinimized ? '최대화' : '최소화'}>
          {isMinimized ? '□' : '—'}
        </button>
        <button
          className="floating-header__btn floating-header__btn--close"
          onClick={onClose}
          title="닫기"
          aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  )
}
