import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SourceLocation } from '../../utils'

interface SourceTraceStore {
  sourcePath: SourceLocation | null
  isActive: boolean
  error: string | null
  setSourcePath: (path: SourceLocation | null) => void
  setError: (error: string | null) => void
  setActive: (active: boolean) => void
  reset: () => void
}

export const useSourceTraceStore = create<SourceTraceStore>()(
  persist(
    (set) => ({
      sourcePath: null,
      isActive: false,
      error: null,

      setSourcePath: (sourcePath) => set({ sourcePath, error: null }),

      setError: (error) => set({ error, sourcePath: null }),

      setActive: (isActive) =>
        set({
          isActive,
          ...(isActive ? {} : { sourcePath: null, error: null })
        }),

      reset: () => set({ sourcePath: null, error: null })
    }),
    {
      name: 'devfloat-source-trace-storage',
      partialize: (state) => ({
        isActive: state.isActive
      })
    }
  )
)
