import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '../lib/api'

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await auth.login(email, password)
            
            // Store tokens in localStorage
            localStorage.setItem('apex_token', response.access_token)
            localStorage.setItem('apex_refresh_token', response.refresh_token)
            localStorage.setItem('apex_user', JSON.stringify({
                user_id: response.user_id,
                email: response.email,
                full_name: response.full_name,
                role: response.role
            }))
            
            // Redirect based on role
            if (response.role === 'admin') {
                router.push('/admin')
            } else if (response.role === 'freelancer') {
                router.push('/freelancer')
            } else {
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            <Head>
                <title>Sign In - Architex Axis</title>
                <meta name="description" content="Sign in to your Architex Axis account" />
            </Head>

            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                        <path d="M0 200L200 0L400 200L200 400Z" stroke="white" strokeWidth="0.5" />
                        <path d="M50 200L200 50L350 200L200 350Z" stroke="white" strokeWidth="0.5" />
                        <path d="M100 200L200 100L300 200L200 300Z" stroke="white" strokeWidth="0.5" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <Link href="/" className="flex items-center space-x-4">
                        <div className="w-14 h-14 relative">
                            <Image 
                                src="/logo.png" 
                                alt="Architex Axis Logo" 
                                fill 
                                className="object-contain drop-shadow-lg"
                                priority
                            />
                        </div>
                        <span className="text-3xl font-bold font-roboto tracking-tight">Architex Axis</span>
                    </Link>
                </div>
                <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl font-bold font-roboto leading-tight">Where Architecture<br />Meets Innovation</h2>
                    <p className="text-teal-100 text-lg max-w-md font-light">Transform your architectural vision into reality with AI-powered compliance and expert collaboration.</p>
                    <div className="flex space-x-8">
                        <div>
                            <div className="text-3xl font-bold font-roboto">500+</div>
                            <div className="text-sm text-teal-200">Projects Completed</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold font-roboto">98%</div>
                            <div className="text-sm text-teal-200">Client Satisfaction</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold font-roboto"><4h</div>
                            <div className="text-sm text-teal-200">Avg. Turnaround</div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 text-sm text-teal-200">
                    © 2026 Architex Axis. All rights reserved.
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="lg:hidden mb-6">
                            <Link href="/" className="inline-flex items-center space-x-3">
                                <div className="w-12 h-12 relative">
                                    <Image 
                                        src="/logo.png" 
                                        alt="Architex Axis Logo" 
                                        fill 
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                <span className="text-2xl font-bold font-roboto text-teal-800">Architex Axis</span>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold font-roboto text-slate-900">Welcome back</h1>
                        <p className="text-slate-500 mt-2 font-light">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                                <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700">Forgot password?</Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-teal-500/30"
                            id="login-submit"
                        >
                            {loading ? (
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-primary-600 font-semibold hover:text-primary-700">Create one</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
