import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import Modal, { ConfirmDialog, Toast } from '../components/Modal'
import * as api from '../lib/api'
import { withAuth } from '../contexts/AuthContext'

// Fallback mock data when backend is unavailable
const MOCK_PROJECTS = [
  { id: 1, title: 'Residential Extension – Sandton', project_type: 'additions', status: 'in_progress', estimated_cost: 8500, created_at: '2026-01-20', estimated_timeline_days: 7, description: 'Two-bedroom extension with garage conversion.' },
  { id: 2, title: 'Office Compliance Check – Rosebank', project_type: 'compliance_check', status: 'completed', estimated_cost: 1200, created_at: '2026-01-15', estimated_timeline_days: 2, description: 'Full SANS 10400 compliance review for commercial office.' },
  { id: 3, title: 'New House Plans – Fourways', project_type: 'new_drawing', status: 'pending', estimated_cost: 12000, created_at: '2026-02-05', estimated_timeline_days: 10, description: 'Complete house plans: 3 bed, 2 bath, double garage.' },
  { id: 4, title: 'Boundary Wall Query', project_type: 'regulatory_query', status: 'ai_review', estimated_cost: 350, created_at: '2026-02-08', estimated_timeline_days: 1, description: 'Zoning question about boundary wall height limits in Bryanston.' },
]

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  payment_pending: { label: 'Payment Pending', color: 'text-orange-700', bg: 'bg-orange-100' },
  payment_received: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-100' },
  ai_review: { label: 'AI Review', color: 'text-purple-700', bg: 'bg-purple-100' },
  freelancer_revision: { label: 'Revision', color: 'text-orange-700', bg: 'bg-orange-100' },
  admin_review: { label: 'Admin Review', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
}

const typeLabels: Record<string, string> = {
  compliance_check: 'Compliance Check',
  new_drawing: 'New Drawing',
  additions: 'Additions',
  regulatory_query: 'Regulatory Query',
}

function Dashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null)
  const [filter, setFilter] = useState('all')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.projects.list()
      // Robustly handle array or object response
      const list = Array.isArray(data) ? data : (data.projects || [])
      setProjects(list.length ? list : MOCK_PROJECTS)
    } catch {
      setProjects(MOCK_PROJECTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => (p.status || '').toLowerCase() === filter)

  const openDetail = (project: any) => {
    setSelectedProject(project)
    setDetailOpen(true)
  }

  const openCancelConfirm = (project: any) => {
    setCancelTarget(project)
    setCancelConfirmOpen(true)
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      await api.projects.updateStatus(cancelTarget.id, 'cancelled')
      setProjects(prev => prev.map(p => p.id === cancelTarget.id ? { ...p, status: 'cancelled' } : p))
      setToast({ message: `Project "${cancelTarget.title}" cancelled.`, type: 'info' })
    } catch {
      setProjects(prev => prev.map(p => p.id === cancelTarget.id ? { ...p, status: 'cancelled' } : p))
      setToast({ message: `Project "${cancelTarget.title}" cancelled.`, type: 'info' })
    }
    setCancelConfirmOpen(false)
    setCancelTarget(null)
  }

  const stats = {
    total: projects.length,
    active: projects.filter(p => !['completed', 'cancelled'].includes((p.status || '').toLowerCase())).length,
    completed: projects.filter(p => (p.status || '').toLowerCase() === 'completed').length,
    spending: projects.reduce((acc: number, p: any) => acc + (p.estimated_cost || 0), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>My Projects – Architex Axis</title>
        <meta name="description" content="View and manage your architectural projects" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-500 mt-1">Track your architectural projects and compliance checks</p>
          </div>
          <Link href="/start" className="mt-4 md:mt-0 inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: stats.total, icon: '📁', bg: 'from-gray-50 to-slate-50 border-gray-100' },
            { label: 'Active', value: stats.active, icon: '🔄', bg: 'from-blue-50 to-indigo-50 border-blue-100' },
            { label: 'Completed', value: stats.completed, icon: '✅', bg: 'from-green-50 to-emerald-50 border-green-100' },
            { label: 'Total Spend', value: `R${stats.spending.toLocaleString()}`, icon: '💰', bg: 'from-primary-50 to-blue-50 border-primary-100' },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.bg} p-5 rounded-xl border`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
                <span className="text-2xl">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'ai_review', label: 'AI Review' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading projects…</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">No projects found</p>
            <Link href="/start" className="text-primary-600 font-medium hover:underline">Start a new project →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map(project => {
              const st = statusConfig[(project.status || 'pending').toLowerCase()] || statusConfig.pending
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition cursor-pointer"
                  onClick={() => openDetail(project)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{typeLabels[(project.project_type || '').toLowerCase()] || project.project_type}</p>
                    <div className="flex items-center space-x-6 mt-2 text-xs text-gray-400">
                      <div className="flex items-center space-x-6 mt-2 text-xs text-gray-400">
                        <span>Created: {project.created_at}</span>
                        <span>Timeline: {project.estimated_timeline_days} days</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-primary-600">R{(project.estimated_cost || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Project Detail Modal ── */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Project Details" size="lg">
        {selectedProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{selectedProject.title}</h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${(statusConfig[(selectedProject.status || 'pending').toLowerCase()] || statusConfig.pending).bg} ${(statusConfig[(selectedProject.status || 'pending').toLowerCase()] || statusConfig.pending).color}`}>
                {(statusConfig[(selectedProject.status || 'pending').toLowerCase()] || statusConfig.pending).label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-medium">Service Type</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{typeLabels[(selectedProject.project_type || '').toLowerCase()] || selectedProject.project_type}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-medium">Estimated Cost</p>
                <p className="text-sm font-semibold text-primary-600 mt-1">R{(selectedProject.estimated_cost || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-medium">Timeline</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{selectedProject.estimated_timeline_days} days</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-medium">Created</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{selectedProject.created_at}</p>
              </div>
            </div>

            {selectedProject.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">{selectedProject.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              {selectedProject.status === 'completed' && (
                <button className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                  Download Report
                </button>
              )}
              {['pending', 'payment_pending'].includes((selectedProject.status || '').toLowerCase()) && (
                <button className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition">
                  Make Payment
                </button>
              )}
              {!['completed', 'cancelled'].includes((selectedProject.status || '').toLowerCase()) && (
                <button
                  onClick={() => { setDetailOpen(false); openCancelConfirm(selectedProject) }}
                  className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                >
                  Cancel Project
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Cancel Confirmation ── */}
      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Project"
        message={`Are you sure you want to cancel "${cancelTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Cancel"
        confirmColor="red"
      />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// Protect dashboard - only for clients and admins
export default withAuth(Dashboard, ['client', 'admin'])
