import { useCallback } from "react";
import { useFloatingStore } from "../store/floatingStore";
import { useDraggable } from "../hooks/useDraggable";
import { useResizable } from "../hooks/useResizable";

interface FloatingHeaderProps {
  onClose: () => void;
}

const APP_ROOT_ID = "devfloat-app-root";

export function FloatingHeader({ onClose }: FloatingHeaderProps) {
  const { setPosition } = useFloatingStore();

  const handleDragEnd = useCallback(
    (position: { top: number; left: number }) => {
      setPosition(position);
    },
    [setPosition],
  );

  const { isDragging, handleMouseDown } = useDraggable({
    targetId: APP_ROOT_ID,
    onDragEnd: handleDragEnd,
  });

  const { isResizing, handleMouseDown: handleResizeMouseDown } = useResizable({
    targetId: APP_ROOT_ID,
  });

  return (
    <>
      <div
        className="floating-header"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="floating-header__title">🔧 DevFloat</div>

        <div className="floating-header__controls">
          <button
            className="floating-header__btn floating-header__btn--close"
            onClick={onClose}
            title="닫기"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </div>
      <div
        className="resize-handle"
        onMouseDown={handleResizeMouseDown}
        style={{ cursor: isResizing ? "nwse-resize" : "nwse-resize" }}
        title="크기 조절"
        aria-label="크기 조절"
      />
    </>
  );
}
