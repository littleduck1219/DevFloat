import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ActiveFeature = 'api-tester' | 'source-trace'

interface WindowPosition {
  top: number
  left: number
}

interface FloatingStore {
  isMinimized: boolean
  isVisible: boolean
  activeFeature: ActiveFeature
  position: WindowPosition
  setMinimized: (minimized: boolean) => void
  setVisible: (visible: boolean) => void
  setActiveFeature: (feature: ActiveFeature) => void
  toggleMinimized: () => void
  toggle: () => void
  setPosition: (position: Partial<WindowPosition>) => void
}

const DEFAULT_POSITION: WindowPosition = {
  top: 20,
  left: 0
}

export const useFloatingStore = create<FloatingStore>()(
  persist(
    (set) => ({
      isMinimized: false,
      isVisible: false,
      activeFeature: 'api-tester',
      position: DEFAULT_POSITION,

      setMinimized: (isMinimized) => set({ isMinimized }),

      setVisible: (isVisible) => set({ isVisible }),

      setActiveFeature: (activeFeature) => set({ activeFeature }),

      toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),

      toggle: () => set((state) => ({ isVisible: !state.isVisible })),

      setPosition: (newPosition) =>
        set((state) => ({
          position: { ...state.position, ...newPosition }
        }))
    }),
    {
      name: 'devfloat-floating-storage',
      partialize: (state) => ({
        activeFeature: state.activeFeature,
        position: state.position
      })
    }
  )
)
