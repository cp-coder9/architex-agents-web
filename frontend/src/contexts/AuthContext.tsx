/**
 * Authentication Context - Global auth state management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import * as api from '../lib/api'

interface User {
    user_id: number
    email: string
    full_name: string
    role: 'client' | 'freelancer' | 'admin'
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (data: { email: string; password: string; full_name: string; role: string }) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('apex_user')
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch {
                localStorage.removeItem('apex_user')
                localStorage.removeItem('apex_token')
                localStorage.removeItem('apex_refresh_token')
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        const response = await api.auth.login(email, password)
        
        // Store tokens
        localStorage.setItem('apex_token', response.access_token)
        localStorage.setItem('apex_refresh_token', response.refresh_token)
        
        const userData = {
            user_id: response.user_id,
            email: response.email,
            full_name: response.full_name,
            role: response.role
        }
        
        localStorage.setItem('apex_user', JSON.stringify(userData))
        setUser(userData)
        
        // Redirect based on role
        if (response.role === 'admin') {
            router.push('/admin')
        } else if (response.role === 'freelancer') {
            router.push('/freelancer')
        } else {
            router.push('/dashboard')
        }
    }

    const register = async (data: { email: string; password: string; full_name: string; role: string }) => {
        const response = await api.auth.register(data)
        
        // Store tokens
        localStorage.setItem('apex_token', response.access_token)
        localStorage.setItem('apex_refresh_token', response.refresh_token)
        
        const userData = {
            user_id: response.user_id,
            email: response.email,
            full_name: response.full_name,
            role: response.role
        }
        
        localStorage.setItem('apex_user', JSON.stringify(userData))
        setUser(userData)
        
        // Redirect based on role
        if (response.role === 'admin') {
            router.push('/admin')
        } else if (response.role === 'freelancer') {
            router.push('/freelancer')
        } else {
            router.push('/dashboard')
        }
    }

    const logout = () => {
        localStorage.removeItem('apex_token')
        localStorage.removeItem('apex_refresh_token')
        localStorage.removeItem('apex_user')
        setUser(null)
        router.push('/login')
    }

    const refreshUser = async () => {
        try {
            const response = await api.request('/api/auth/me')
            const userData = {
                user_id: response.user_id,
                email: response.email,
                full_name: response.full_name,
                role: response.role
            }
            localStorage.setItem('apex_user', JSON.stringify(userData))
            setUser(userData)
        } catch {
            // Token invalid, logout
            logout()
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook for using auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// HOC for protected routes
export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles?: ('client' | 'freelancer' | 'admin')[]
) {
    return function WithAuthComponent(props: P) {
        const { user, isAuthenticated, isLoading } = useAuth()
        const router = useRouter()

        useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push('/login')
                return
            }

            if (!isLoading && allowedRoles && user && !allowedRoles.includes(user.role)) {
                // User doesn't have required role, redirect to their dashboard
                if (user.role === 'admin') {
                    router.push('/admin')
                } else if (user.role === 'freelancer') {
                    router.push('/freelancer')
                } else {
                    router.push('/dashboard')
                }
            }
        }, [isLoading, isAuthenticated, user, router])

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
                </div>
            )
        }

        if (!isAuthenticated) {
            return null // Will redirect
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            return null // Will redirect
        }

        return <WrappedComponent {...props} />
    }
}

// Hook for role-based access
export function useRequireRole(roles: ('client' | 'freelancer' | 'admin')[]) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
            return
        }

        if (!isLoading && user && !roles.includes(user.role)) {
            // Redirect to appropriate dashboard
            if (user.role === 'admin') {
                router.push('/admin')
            } else if (user.role === 'freelancer') {
                router.push('/freelancer')
            } else {
                router.push('/dashboard')
            }
        }
    }, [isLoading, isAuthenticated, user, roles, router])

    return { user, isAuthenticated, isLoading }
}
