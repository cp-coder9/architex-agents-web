import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [service, setService] = useState('')

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Architex Axis - Architectural Compliance Platform</title>
        <meta name="description" content="AI-driven architectural compliance and design platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Architectural Compliance Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your architectural plans and get instant compliance checks with our AI-powered platform.
            Fast, accurate, and compliant with all regulations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/start" className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
              Start Your Project
            </Link>
            <Link href="/docs" className="px-8 py-4 bg-white text-primary-600 border border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-gray-600">AI-powered compliance checking with human oversight</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Compliance Checks</h3>
              <p className="text-gray-600">Instant automated compliance checking against SANS 10400, Johannesburg regulations, and more.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Human Expertise</h3>
              <p className="text-gray-600">Freelance architects review AI findings and ensure quality before submission.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Turnaround</h3>
              <p className="text-gray-600">Get compliance reports in hours, not days. Track your project in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Upload your plans and get an instant quote. Our AI will analyze your project and connect you with the right experts.</p>
          <Link href="/start" className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Architex Axis</h3>
              <p className="text-gray-400">AI-driven architectural compliance platform</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services/compliance" className="hover:text-white">Compliance Checks</Link></li>
                <li><Link href="/services/drawings" className="hover:text-white">Architectural Drawings</Link></li>
                <li><Link href="/services/consulting" className="hover:text-white">Consulting</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Regulations</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/regulations/sans" className="hover:text-white">SANS 10400</Link></li>
                <li><Link href="/regulations/jhb" className="hover:text-white">Johannesburg</Link></li>
                <li><Link href="/regulations/national" className="hover:text-white">National Building Regulations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@architexaxis.co.za</li>
                <li>+27 11 123 4567</li>
                <li>Johannesburg, South Africa</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Architex Axis Pty Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
