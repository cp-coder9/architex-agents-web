import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ProjectDetails() {
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      // Simulate fetching project details
      const fetchProject = async () => {
        setLoading(true)
        setProject({
          id: Number(id),
          title: "Residential Extension",
          type: "Additions & Alterations",
          status: "in_progress",
          description: "Extension to existing residential property including new kitchen and bathroom",
          created_at: "2026-02-05",
          estimated_completion: "2026-02-15",
          cost: "R8500",
          files: [
            { name: "site_plan.pdf", size: "2.4 MB", type: "PDF" },
            { name: "existing_drawings.dwg", size: "1.8 MB", type: "DWG" },
            { name: "proposed_plans.pdf", size: "3.1 MB", type: "PDF" }
          ],
          compliance_results: {
            overall_status: "PASS",
            agents: {
              wall_agent: { status: "completed", is_compliant: true },
              dimension_agent: { status: "completed", is_compliant: true },
              window_door_agent: { status: "completed", is_compliant: true },
              area_agent: { status: "completed", is_compliant: true },
              energy_agent: { status: "completed", is_compliant: true },
              council_agent: { status: "completed", is_compliant: true }
            }
          }
        })
        setLoading(false)
      }
      fetchProject()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
            <Link href="/dashboard" className="text-primary-600 mt-4 inline-block">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      payment_pending: 'bg-yellow-100 text-yellow-800',
      payment_received: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-blue-100 text-blue-800',
      ai_review: 'bg-purple-100 text-purple-800',
      freelancer_revision: 'bg-orange-100 text-orange-800',
      admin_review: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{project.title} - Project Details</title>
        <meta name="description" content={`Project details for ${project.title}`} />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <div className="flex items-center mt-2 space-x-4">
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-gray-500">Created: {project.created_at}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
              Back to Dashboard
            </Link>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
              Download Report
            </button>
          </div>
        </div>

        {/* Project Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Project Type</h3>
            <p className="text-gray-600">{project.type}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Estimated Cost</h3>
            <p className="text-2xl font-bold text-primary-600">{project.cost}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Estimated Completion</h3>
            <p className="text-gray-600">{project.estimated_completion}</p>
          </div>
        </div>

        {/* Compliance Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Compliance Results</h2>
          
          <div className="flex items-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${project.compliance_results.overall_status === 'PASS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">Overall Status: {project.compliance_results.overall_status}</h3>
              <p className="text-gray-600">All compliance checks completed successfully</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(project.compliance_results.agents).map(([agent, result]) => (
              <div key={agent} className={`p-4 rounded-lg ${result.is_compliant ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold capitalize">{agent.replace('_', ' ')}</span>
                  {result.is_compliant ? (
                    <span className="text-green-600">Compliant</span>
                  ) : (
                    <span className="text-red-600">Non-compliant</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Files */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Project Files</h2>
          <div className="space-y-3">
            {project.files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">{file.name}</div>
                    <div className="text-sm text-gray-500">{file.size} • {file.type}</div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Project Timeline</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>
            
            <div className="relative flex justify-between mb-8">
              <div className="w-1/2 pr-8 text-right">
                <div className="bg-gray-100 p-4 rounded-lg inline-block">
                  <div className="font-semibold">Project Started</div>
                  <div className="text-sm text-gray-600">{project.created_at}</div>
                </div>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full"></div>
              <div className="w-1/2 pl-8">
                <div className="bg-gray-100 p-4 rounded-lg inline-block">
                  <div className="font-semibold">Compliance Check</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-between">
              <div className="w-1/2 pr-8 text-right">
                <div className="bg-gray-100 p-4 rounded-lg inline-block opacity-50">
                  <div className="font-semibold">Final Review</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="w-1/2 pl-8">
                <div className="bg-gray-100 p-4 rounded-lg inline-block opacity-50">
                  <div className="font-semibold">Completed</div>
                  <div className="text-sm text-gray-600">{project.estimated_completion}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
