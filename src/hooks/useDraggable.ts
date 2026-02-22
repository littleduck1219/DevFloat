import { useState, useRef, useCallback, useEffect } from 'react'

interface DragState {
  startX: number
  startY: number
  startLeft: number
  startTop: number
}

interface UseDraggableOptions {
  targetId: string
  minWindowSize?: { width: number; height: number }
  onDragEnd?: (position: { top: number; left: number }) => void
}

interface UseDraggableReturn {
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
}

export function useDraggable({
  targetId,
  minWindowSize = { width: 400, height: 300 },
  onDragEnd
}: UseDraggableOptions): UseDraggableReturn {
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<DragState | null>(null)

  const getTargetElement = useCallback((): HTMLElement | null => {
    return document.getElementById(targetId)
  }, [targetId])

  const calculateConstrainedPosition = useCallback(
    (deltaX: number, deltaY: number): { left: number; top: number } => {
      if (!dragRef.current) return { left: 0, top: 0 }

      const maxLeft = window.innerWidth - minWindowSize.width
      const maxTop = window.innerHeight - minWindowSize.height

      const newLeft = Math.max(0, Math.min(maxLeft, dragRef.current.startLeft + deltaX))
      const newTop = Math.max(0, Math.min(maxTop, dragRef.current.startTop + deltaY))

      return { left: newLeft, top: newTop }
    },
    [minWindowSize]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return

      const deltaX = e.clientX - dragRef.current.startX
      const deltaY = e.clientY - dragRef.current.startY

      const { left, top } = calculateConstrainedPosition(deltaX, deltaY)

      const target = getTargetElement()
      if (target) {
        target.style.left = `${left}px`
        target.style.top = `${top}px`
        target.style.right = 'auto'
      }
    },
    [calculateConstrainedPosition, getTargetElement]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)

    const target = getTargetElement()
    if (target && dragRef.current && onDragEnd) {
      const deltaX = 0
      const deltaY = 0
      const { left, top } = calculateConstrainedPosition(deltaX, deltaY)
      onDragEnd({ top, left })
    }

    dragRef.current = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [calculateConstrainedPosition, getTargetElement, handleMouseMove, onDragEnd])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = getTargetElement()
      if (!target) return

      setIsDragging(true)
      const rect = target.getBoundingClientRect()

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: rect.left,
        startTop: rect.top
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

  return { isDragging, handleMouseDown }
}
