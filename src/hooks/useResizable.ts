import { useState, useRef, useCallback, useEffect } from 'react'

interface ResizeState {
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

interface WindowSize {
  width: number
  height: number
}

interface UseResizableOptions {
  targetId: string
  minSize?: WindowSize
  onResizeEnd?: (size: WindowSize) => void
}

interface UseResizableReturn {
  isResizing: boolean
  handleMouseDown: (e: React.MouseEvent) => void
}

export function useResizable({
  targetId,
  minSize = { width: 400, height: 300 },
  onResizeEnd
}: UseResizableOptions): UseResizableReturn {
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<ResizeState | null>(null)

  const getTargetElement = useCallback((): HTMLElement | null => {
    return document.getElementById(targetId)
  }, [targetId])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeRef.current) return

      const deltaX = e.clientX - resizeRef.current.startX
      const deltaY = e.clientY - resizeRef.current.startY

      const newWidth = Math.max(
        minSize.width,
        resizeRef.current.startWidth + deltaX
      )
      const newHeight = Math.max(
        minSize.height,
        resizeRef.current.startHeight + deltaY
      )

      const target = getTargetElement()
      if (target) {
        target.style.width = `${newWidth}px`
        target.style.height = `${newHeight}px`
      }
    },
    [minSize, getTargetElement]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)

    const target = getTargetElement()
    if (target && resizeRef.current && onResizeEnd) {
      const newWidth = Math.max(
        minSize.width,
        resizeRef.current.startWidth
      )
      const newHeight = Math.max(
        minSize.height,
        resizeRef.current.startHeight
      )
      onResizeEnd({ width: newWidth, height: newHeight })
    }

    resizeRef.current = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [minSize, getTargetElement, handleMouseMove, onResizeEnd])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = getTargetElement()
      if (!target) return

      e.preventDefault()
      e.stopPropagation()

      setIsResizing(true)

      const rect = target.getBoundingClientRect()

      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: rect.width,
        startHeight: rect.height
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [getTargetElement, handleMouseMove, handleMouseUp]
  )

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return { isResizing, handleMouseDown }
}
