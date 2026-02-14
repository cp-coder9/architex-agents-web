import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '../lib/api'

export default function Register() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'client',
        agreeTerms: false
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement
        const name = target.name === 'fullName' ? 'full_name' : target.name
        setFormData({
            ...formData,
            [name]: target.type === 'checkbox' ? target.checked : target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (!formData.agreeTerms) {
            setError('Please agree to the terms and conditions')
            setLoading(false)
            return
        }

        try {
            const response = await auth.register({
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                role: formData.role
            })

            // Store tokens in localStorage
            localStorage.setItem('architex_token', response.access_token)
            localStorage.setItem('architex_refresh_token', response.refresh_token)
            localStorage.setItem('architex_user', JSON.stringify({
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
            setError(err.message || 'Registration failed. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            <Head>
                <title>Create Account - Architex Axis</title>
                <meta name="description" content="Create your Architex Axis account" />
            </Head>

            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                        <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="0.5" />
                        <circle cx="200" cy="200" r="130" stroke="white" strokeWidth="0.5" />
                        <circle cx="200" cy="200" r="80" stroke="white" strokeWidth="0.5" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <Link href="/" className="flex items-center space-x-3">
                        <Image
                            src="/logo.png"
                            alt="Architex Axis Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                            priority
                        />
                        <span className="text-2xl font-bold">Architex Axis</span>
                    </Link>
                </div>
                <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl font-bold leading-tight">Join the Future of<br />Architecture</h2>
                    <p className="text-teal-100 text-lg max-w-md">Whether you're a client needing compliance checks or a freelancer architect — get started in under 5 minutes.</p>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm">AI-powered compliance checks in hours</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm">Expert architect network</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm">Real-time project tracking</span>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 text-sm text-teal-200">
                    © 2026 Architex Axis Pty Ltd
                </div>
            </div>


            {/* Right Panel — Registration Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="lg:hidden mb-6">
                            <Link href="/" className="inline-flex items-center space-x-2">
                                <Image
                                    src="/logo.png"
                                    alt="Architex Axis Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                    priority
                                />
                                <span className="text-xl font-bold text-gray-900">Architex Axis</span>
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">I am a...</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                                >
                                    <option value="client">Client — I need architectural services</option>
                                    <option value="freelancer">Freelancer — I'm an architect / drafter</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                    <input
                                        id="register-password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-start space-x-2">
                                <input
                                    id="agreeTerms"
                                    name="agreeTerms"
                                    type="checkbox"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                id="register-submit"
                            >
                                {loading ? (
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
