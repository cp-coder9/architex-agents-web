import { useState, useEffect, useRef } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showClose?: boolean
}

const sizeClasses: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Panel */}
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all animate-modalIn`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    {showClose && (
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
            </div>

            <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modalIn { animation: modalIn 0.2s ease-out; }
      `}</style>
        </div>
    )
}

// Confirmation dialog variant
interface ConfirmProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmLabel?: string
    confirmColor?: 'primary' | 'red' | 'green'
    loading?: boolean
}

const colorMap: Record<string, string> = {
    primary: 'bg-primary-600 hover:bg-primary-700',
    red: 'bg-red-600 hover:bg-red-700',
    green: 'bg-green-600 hover:bg-green-700',
}

export function ConfirmDialog({
    isOpen, onClose, onConfirm, title, message,
    confirmLabel = 'Confirm', confirmColor = 'primary', loading = false
}: ConfirmProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition ${colorMap[confirmColor]} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Processing…' : confirmLabel}
                </button>
            </div>
        </Modal>
    )
}

// Toast notification component
interface ToastProps {
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    onClose: () => void
}

const toastColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: '✓' },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '✕' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'ℹ' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: '⚠' },
}

export function Toast({ message, type, onClose }: ToastProps) {
    const colors = toastColors[type]

    useEffect(() => {
        const timer = setTimeout(onClose, 4000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={`fixed top-4 right-4 z-[200] flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-lg ${colors.bg} ${colors.border} animate-slideIn`}>
            <span className={`text-lg font-bold ${colors.text}`}>{colors.icon}</span>
            <span className={`text-sm font-medium ${colors.text}`}>{message}</span>
            <button onClick={onClose} className={`ml-2 ${colors.text} hover:opacity-70`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
        </div>
    )
}
