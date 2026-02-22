import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface ApiRequest {
  method: HttpMethod
  url: string
  headers: Record<string, string>
  body: string
}

export interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: string
  responseTime: number
}

export interface ApiError {
  message: string
  code?: string
  responseTime: number
}

export interface RequestHistoryItem {
  id: string
  url: string
  method: HttpMethod
  request: ApiRequest
  timestamp: number
}

interface ApiStore {
  request: ApiRequest
  response: ApiResponse | null
  error: ApiError | null
  isLoading: boolean
  history: RequestHistoryItem[]
  setRequest: (request: Partial<ApiRequest>) => void
  setResponse: (response: ApiResponse | null) => void
  setError: (error: ApiError | null) => void
  setLoading: (loading: boolean) => void
  executeRequest: () => Promise<void>
  addHeader: (key: string, value: string) => void
  removeHeader: (key: string) => void
  updateHeader: (key: string, value: string) => void
  clearResponse: () => void
  loadFromHistory: (item: RequestHistoryItem) => void
  clearHistory: () => void
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function createErrorResponse(message: string, responseTime: number, code?: string): ApiError {
  return { message, responseTime, code }
}

function generateHistoryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const MAX_HISTORY_SIZE = 50

export const useApiStore = create<ApiStore>()(
  persist(
    (set, get) => ({
      request: {
        method: 'GET',
        url: '',
        headers: {},
        body: ''
      },
      response: null,
      error: null,
      isLoading: false,
      history: [],

      setRequest: (newRequest) =>
        set((state) => ({
          request: { ...state.request, ...newRequest },
          error: null
        })),

      setResponse: (response) => set({ response, error: null }),

      setError: (error) => set({ error, response: null }),

      setLoading: (isLoading) => set({ isLoading }),

      clearResponse: () => set({ response: null, error: null }),

      addHeader: (key, value) =>
        set((state) => ({
          request: {
            ...state.request,
            headers: { ...state.request.headers, [key]: value }
          }
        })),

      removeHeader: (key) =>
        set((state) => {
          const { [key]: _, ...rest } = state.request.headers
          return { request: { ...state.request, headers: rest } }
        }),

      updateHeader: (key, value) =>
        set((state) => ({
          request: {
            ...state.request,
            headers: { ...state.request.headers, [key]: value }
          }
        })),

      loadFromHistory: (item) =>
        set({
          request: item.request,
          response: null,
          error: null
        }),

      clearHistory: () => set({ history: [] }),

      executeRequest: async () => {
        const { request, setLoading, setError, history } = get()

        const trimmedUrl = request.url.trim()
        if (!trimmedUrl) {
          setError(createErrorResponse('URL이 필요합니다', 0, 'EMPTY_URL'))
          return
        }

        if (!isValidUrl(trimmedUrl)) {
          setError(createErrorResponse('유효하지 않은 URL 형식입니다', 0, 'INVALID_URL'))
          return
        }

        setLoading(true)
        const startTime = Date.now()

        try {
          const options: RequestInit = {
            method: request.method,
            headers: request.headers
          }

          if (!['GET', 'HEAD'].includes(request.method) && request.body.trim()) {
            options.body = request.body
          }

          const response = await fetch(trimmedUrl, options)
          const responseTime = Date.now() - startTime

          let responseText: string
          try {
            responseText = await response.text()
          } catch {
            responseText = 'Failed to read response body'
          }

          const responseHeaders: Record<string, string> = {}
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value
          })

          const newHistoryItem: RequestHistoryItem = {
            id: generateHistoryId(),
            url: request.url,
            method: request.method,
            request: { ...request },
            timestamp: Date.now()
          }

          set({
            response: {
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders,
              data: responseText,
              responseTime
            },
            history: [newHistoryItem, ...history].slice(0, MAX_HISTORY_SIZE)
          })
        } catch (error) {
          const responseTime = Date.now() - startTime
          let errorMessage = 'Unknown error occurred'
          let errorCode = 'UNKNOWN_ERROR'

          if (error instanceof TypeError) {
            errorMessage = 'Network error: Unable to connect to the server'
            errorCode = 'NETWORK_ERROR'
          } else if (error instanceof Error) {
            errorMessage = error.message
            errorCode = 'REQUEST_ERROR'
          }

          setError(createErrorResponse(errorMessage, responseTime, errorCode))
        } finally {
          setLoading(false)
        }
      }
    }),
    {
      name: 'devfloat-api-tester-storage',
      partialize: (state) => ({
        history: state.history
      })
    }
  )
)
