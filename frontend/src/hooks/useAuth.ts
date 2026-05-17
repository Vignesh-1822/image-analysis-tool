import { createContext, createElement, useContext, useState, useCallback, type ReactNode } from 'react'

const TOKEN_KEY = 'app_token'

interface AuthContextType {
  isAuthenticated: boolean
  signIn: (token: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY))

  const signIn = useCallback((t: string) => {
    sessionStorage.setItem(TOKEN_KEY, t)
    setToken(t)
  }, [])

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  return createElement(AuthContext.Provider, { value: { isAuthenticated: !!token, signIn, signOut } }, children)
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
