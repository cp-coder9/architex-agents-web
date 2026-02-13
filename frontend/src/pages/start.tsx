import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function StartProject() {
  const [step, setStep] = useState(1)
  const [service, setService] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Start Your Project - Architex Axis</title>
        <meta name="description" content="Start your architectural compliance project" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Start Your Architectural Project
          </h1>
          <p className="text-gray-600">Follow the steps below to get started</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex justify-between">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="text-sm">Service</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm">Upload</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="text-sm">Review</span>
            </div>
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Select Your Service</h2>
            <div className="space-y-4">
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition ${service === 'compliance' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}
                onClick={() => setService('compliance')}
              >
                <h3 className="text-xl font-semibold">Compliance Check</h3>
                <p className="text-gray-600 mt-2">Get instant compliance checking against SANS 10400, Johannesburg regulations, and more.</p>
                <p className="text-primary-600 font-semibold mt-2">R500 - R2000</p>
              </div>
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition ${service === 'drawings' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}
                onClick={() => setService('drawings')}
              >
                <h3 className="text-xl font-semibold">Architectural Drawings</h3>
                <p className="text-gray-600 mt-2">Professional architectural drawings created by our expert team of architects.</p>
                <p className="text-primary-600 font-semibold mt-2">R2000 - R10000</p>
              </div>
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition ${service === 'additions' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}
                onClick={() => setService('additions')}
              >
                <h3 className="text-xl font-semibold">Additions & Alterations</h3>
                <p className="text-gray-600 mt-2">Comprehensive plans for home additions, renovations, and alterations.</p>
                <p className="text-primary-600 font-semibold mt-2">R3000 - R15000</p>
              </div>
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition ${service === 'regulatory' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}
                onClick={() => setService('regulatory')}
              >
                <h3 className="text-xl font-semibold">Regulatory Query</h3>
                <p className="text-gray-600 mt-2">Get expert answers to municipal regulations, zoning, and building code questions.</p>
                <p className="text-primary-600 font-semibold mt-2">R250 - R500</p>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={nextStep}
                disabled={!service}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 2: File Upload */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Upload Your Plans</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 cursor-pointer inline-block">
                Browse Files
              </label>
              {files.length > 0 && (
                <div className="mt-6">
                  <p className="text-gray-600 mb-2">Selected files:</p>
                  <ul className="text-sm text-gray-500">
                    {files.map((file, index) => (
                      <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Describe your project in detail..."
              ></textarea>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={files.length === 0}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Review Your Project</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Service Selected:</h3>
                <p className="text-gray-600 capitalize">{service.replace('_', ' ')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Files Uploaded:</h3>
                <ul className="text-sm text-gray-600">
                  {files.map((file, index) => (
                    <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Estimated Timeline:</h3>
                <p className="text-gray-600">
                  {service === 'compliance' ? '2-4 hours' : service === 'drawings' ? '3-7 days' : service === 'regulatory' ? '1-2 days' : '5-10 days'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Estimated Cost:</h3>
                <p className="text-primary-600 font-semibold text-xl">
                  {service === 'compliance' ? 'R500 - R2,000' : service === 'drawings' ? 'R2,000 - R10,000' : service === 'regulatory' ? 'R250 - R500' : 'R3,000 - R15,000'}
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Back
              </button>
              <button
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                onClick={() => alert('Project submitted! We will contact you shortly.')}
              >
                Submit Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
