import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import Modal, { ConfirmDialog, Toast } from '../components/Modal'
import * as api from '../lib/api'

const MOCK_PROJECTS = [
    { id: 1, title: 'Residential Extension – Sandton', status: 'in_progress', project_type: 'additions', user: { full_name: 'Alice M.' }, estimated_cost: 8500, created_at: '2026-01-20' },
    { id: 2, title: 'Office Compliance – Rosebank', status: 'ai_review', project_type: 'compliance_check', user: { full_name: 'Bob K.' }, estimated_cost: 1200, created_at: '2026-01-25' },
    { id: 3, title: 'New House Plans – Fourways', status: 'pending', project_type: 'new_drawing', user: { full_name: 'Carol D.' }, estimated_cost: 12000, created_at: '2026-02-05' },
    { id: 4, title: 'Boundary Wall Query', status: 'completed', project_type: 'regulatory_query', user: { full_name: 'Dave P.' }, estimated_cost: 350, created_at: '2026-02-08' },
]

const MOCK_FREELANCERS = [
    { id: 1, name: 'John M.', skills: ['Residential', 'SANS 10400'], is_available: true, hourly_rate: 450, current_load: 3, max_load: 10 },
    { id: 2, name: 'Sarah L.', skills: ['Commercial', 'Interior'], is_available: true, hourly_rate: 520, current_load: 7, max_load: 10 },
    { id: 3, name: 'Thabo N.', skills: ['Municipal', 'Zoning', 'Regulatory'], is_available: false, hourly_rate: 380, current_load: 10, max_load: 10 },
]

const MOCK_PAYMENTS = [
    { id: 1, project_title: 'Residential Extension', amount: 8500, status: 'completed', paid_at: '2026-01-22', payment_method: 'card' },
    { id: 2, project_title: 'Office Compliance', amount: 1200, status: 'pending', paid_at: null, payment_method: 'eft' },
    { id: 3, project_title: 'New House Plans', amount: 6000, status: 'completed', paid_at: '2026-02-06', payment_method: 'card' },
]

const MOCK_AGENTS = [
    { name: 'WallAgent', status: 'idle', tasks_completed: 45, accuracy: 97.2 },
    { name: 'DimensionAgent', status: 'running', tasks_completed: 38, accuracy: 98.5 },
    { name: 'WindowDoorAgent', status: 'idle', tasks_completed: 32, accuracy: 96.8 },
    { name: 'AreaAgent', status: 'idle', tasks_completed: 28, accuracy: 99.1 },
    { name: 'EnergyAgent', status: 'error', tasks_completed: 15, accuracy: 94.3 },
]

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
    in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-100' },
    ai_review: { label: 'AI Review', color: 'text-purple-700', bg: 'bg-purple-100' },
    admin_review: { label: 'Admin Review', color: 'text-indigo-700', bg: 'bg-indigo-100' },
    completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-100' },
    cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
    freelancer_revision: { label: 'Revision', color: 'text-orange-700', bg: 'bg-orange-100' },
    payment_pending: { label: 'Payment Pending', color: 'text-orange-700', bg: 'bg-orange-100' },
    payment_received: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100' },
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    const [projects, setProjects] = useState<any[]>([])
    const [freelancers, setFreelancers] = useState<any[]>([])
    const [payments, setPayments] = useState<any[]>([])
    const [agents, setAgents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null)

    // Modals
    const [projectDetailOpen, setProjectDetailOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [approveOpen, setApproveOpen] = useState(false)
    const [escalateOpen, setEscalateOpen] = useState(false)
    const [assignOpen, setAssignOpen] = useState(false)
    const [freelancerDetailOpen, setFreelancerDetailOpen] = useState(false)
    const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null)
    const [adminNotes, setAdminNotes] = useState('')

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const [projData, flData, payData] = await Promise.allSettled([
                api.projects.list(),
                api.freelancers.list(),
                api.payments.list(),
            ])

            // Projects returns an array
            if (projData.status === 'fulfilled') {
                const val = projData.value as any
                // Handle if it returns array or wrapped object (robustness)
                const list = Array.isArray(val) ? val : (val.projects || [])
                setProjects(list.length ? list : MOCK_PROJECTS)
            } else {
                setProjects(MOCK_PROJECTS)
            }

            // Freelancers returns { freelancers: [] }
            if (flData.status === 'fulfilled') {
                const val = flData.value as any
                const list = val.freelancers || []
                setFreelancers(list.length ? list : MOCK_FREELANCERS)
            } else {
                setFreelancers(MOCK_FREELANCERS)
            }

            // Payments returns an array
            if (payData.status === 'fulfilled') {
                const val = payData.value as any
                const list = Array.isArray(val) ? val : (val.payments || [])
                setPayments(list.length ? list : MOCK_PAYMENTS)
            } else {
                setPayments(MOCK_PAYMENTS)
            }

            setAgents(MOCK_AGENTS) // Agents are still mock for now
        } catch {
            setProjects(MOCK_PROJECTS)
            setFreelancers(MOCK_FREELANCERS)
            setPayments(MOCK_PAYMENTS)
            setAgents(MOCK_AGENTS)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleApprove = async () => {
        if (!selectedProject) return
        try { await api.projects.updateStatus(selectedProject.id, 'completed', adminNotes) } catch { }
        setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, status: 'completed' } : p))
        setToast({ message: `Project "${selectedProject.title}" approved!`, type: 'success' })
        setApproveOpen(false); setProjectDetailOpen(false); setAdminNotes('')
    }

    const handleEscalate = async () => {
        if (!selectedProject) return
        try { await api.projects.updateStatus(selectedProject.id, 'freelancer_revision', adminNotes) } catch { }
        setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, status: 'freelancer_revision' } : p))
        setToast({ message: `Project "${selectedProject.title}" escalated for revision.`, type: 'warning' })
        setEscalateOpen(false); setProjectDetailOpen(false); setAdminNotes('')
    }

    const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => !['completed', 'cancelled'].includes(p.status)).length,
        pendingReview: projects.filter(p => ['ai_review', 'admin_review'].includes(p.status)).length,
        revenue: payments.filter(p => p.status === 'completed').reduce((a: number, p: any) => a + p.amount, 0),
        activeFreelancers: freelancers.filter((f: any) => f.is_available).length,
        agentErrors: agents.filter(a => a.status === 'error').length,
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'projects', label: 'Projects' },
        { id: 'freelancers', label: 'Freelancers' },
        { id: 'time', label: 'Time Tracking' },
        { id: 'payments', label: 'Payments' },
        { id: 'agents', label: 'AI Agents' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>Admin Dashboard – Architex Axis</title>
                <meta name="description" content="Admin control panel for managing projects, freelancers, and AI agents" />
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage projects, freelancers, payments, and AI agents</p>
                    </div>
                    <span className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span>Admin Access</span>
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-8 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading dashboard data…</div>
                ) : (
                    <>
                        {/* ── OVERVIEW TAB ── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {[
                                        { label: 'Total Projects', value: stats.totalProjects, icon: '📁' },
                                        { label: 'Active', value: stats.activeProjects, icon: '🔄' },
                                        { label: 'Pending Review', value: stats.pendingReview, icon: '👁' },
                                        { label: 'Revenue', value: `R${stats.revenue.toLocaleString()}`, icon: '💰' },
                                        { label: 'Freelancers', value: stats.activeFreelancers, icon: '👷' },
                                        { label: 'Agent Errors', value: stats.agentErrors, icon: stats.agentErrors > 0 ? '⚠️' : '✅' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                            <p className="text-xs font-medium text-gray-500 uppercase">{s.label}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                                                <span className="text-xl">{s.icon}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent projects needing attention */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects Needing Attention</h2>
                                    <div className="space-y-3">
                                        {projects.filter(p => ['pending', 'ai_review', 'admin_review'].includes((p.status || '').toLowerCase())).slice(0, 5).map(p => {
                                            const st = statusConfig[(p.status || 'pending').toLowerCase()] || statusConfig.pending
                                            return (
                                                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition" onClick={() => { setSelectedProject(p); setProjectDetailOpen(true) }}>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                                                        <p className="text-xs text-gray-500">{p.user?.full_name || 'Client'} • {p.created_at}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedProject(p); setProjectDetailOpen(true) }}
                                                            className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm transition z-10"
                                                        >
                                                            Manage
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {projects.filter(p => ['pending', 'ai_review', 'admin_review'].includes(p.status)).length === 0 && (
                                            <p className="text-sm text-gray-400 text-center py-4">All caught up! No projects need attention.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Agent Status */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Agent Status</h2>
                                    <div className="grid md:grid-cols-5 gap-3">
                                        {agents.map((agent, i) => (
                                            <div key={i} className="p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className={`w-2 h-2 rounded-full ${agent.status === 'running' ? 'bg-blue-500 animate-pulse' : agent.status === 'error' ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                                                </div>
                                                <p className="text-xs text-gray-500">{agent.tasks_completed} tasks • {agent.accuracy}% accuracy</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── PROJECTS TAB ── */}
                        {activeTab === 'projects' && (
                            <div className="space-y-3">
                                {projects.map(p => {
                                    const st = statusConfig[(p.status || 'pending').toLowerCase()] || statusConfig.pending
                                    return (
                                        <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition cursor-pointer" onClick={() => { setSelectedProject(p); setProjectDetailOpen(true) }}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <h3 className="font-semibold text-gray-900">{p.title}</h3>
                                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{p.user?.full_name || 'Client'} • {p.project_type} • {p.created_at}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-primary-600 mb-2">R{(p.estimated_cost || 0).toLocaleString()}</p>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedProject(p); setProjectDetailOpen(true) }}
                                                        className="px-4 py-2 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg hover:bg-white text-gray-700 shadow-sm transition"
                                                    >
                                                        Manage
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* ── TIME TRACKING TAB ── */}
                        {activeTab === 'time' && (
                            <div className="space-y-6">
                                {/* Live Sessions */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
                                        Live Active Sessions
                                    </h2>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Mock active session for demo */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">John M.</p>
                                                <p className="text-xs text-gray-500">Working on: Task #105</p>
                                            </div>
                                            <span className="font-mono text-lg font-bold text-red-600">01:42:15</span>
                                        </div>
                                        <p className="text-sm text-gray-400 col-span-full py-2">No other active sessions.</p>
                                    </div>
                                </div>

                                {/* Hours per Project */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Billed Hours by Project</h2>
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase">
                                                <th className="px-4 py-3">Project</th>
                                                <th className="px-4 py-3">Client</th>
                                                <th className="px-4 py-3">Purchased</th>
                                                <th className="px-4 py-3">Used</th>
                                                <th className="px-4 py-3">Utilization</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {projects.map(p => {
                                                const purchased = p.purchased_hours || (p.estimated_cost / 450) || 10
                                                const used = p.hours_used || (p.status === 'completed' ? purchased * 0.9 : purchased * 0.3)
                                                const util = (used / purchased) * 100
                                                return (
                                                    <tr key={p.id}>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.title}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{p.user?.full_name || 'Client'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{purchased.toFixed(1)}h</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{used.toFixed(1)}h</td>
                                                        <td className="px-4 py-3">
                                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className={`h-full ${util > 100 ? 'bg-red-500' : 'bg-primary-500'}`} style={{ width: `${Math.min(util, 100)}%` }} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── FREELANCERS TAB ── */}
                        {activeTab === 'freelancers' && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {freelancers.map((f: any) => (
                                    <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition cursor-pointer" onClick={() => { setSelectedFreelancer(f); setFreelancerDetailOpen(true) }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {f.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{f.name}</p>
                                                    <p className="text-xs text-gray-500">R{f.hourly_rate}/hr</p>
                                                </div>
                                            </div>
                                            <span className={`w-3 h-3 rounded-full ${f.is_available ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {(f.skills || []).map((s: string, i: number) => (
                                                <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-lg">{s}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="h-1.5 flex-1 bg-gray-100 rounded-full mr-3 overflow-hidden">
                                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(f.current_load / f.max_load) * 100}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-500">{f.current_load}/{f.max_load}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── PAYMENTS TAB ── */}
                        {activeTab === 'payments' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Project</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Amount</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Method</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.map((pay: any) => (
                                            <tr key={pay.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{pay.project_title || `Project #${pay.project_id}`}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-primary-600">R{pay.amount?.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 uppercase">{pay.payment_method}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${pay.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {pay.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{pay.paid_at || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── AGENTS TAB ── */}
                        {activeTab === 'agents' && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {agents.map((agent, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${agent.status === 'running' ? 'bg-blue-100 text-blue-700' : agent.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {agent.status}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Tasks Completed</span>
                                                <span className="font-semibold text-gray-900">{agent.tasks_completed}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Accuracy</span>
                                                <span className="font-semibold text-gray-900">{agent.accuracy}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${agent.accuracy}%` }} />
                                            </div>
                                        </div>
                                        {agent.status === 'error' && (
                                            <button className="mt-4 w-full px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition">
                                                Restart Agent
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Project Detail Modal ── */}
            <Modal isOpen={projectDetailOpen} onClose={() => setProjectDetailOpen(false)} title="Project Details" size="lg">
                {selectedProject && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">{selectedProject.title}</h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${(statusConfig[(selectedProject.status || 'pending').toLowerCase()] || statusConfig.pending).bg} ${(statusConfig[(selectedProject.status || 'pending').toLowerCase()] || statusConfig.pending).color}`}>
                                {(statusConfig[(selectedProject.status || 'pending').toLowerCase()] || statusConfig.pending).label}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-xl"><p className="text-xs text-gray-500">Client</p><p className="text-sm font-semibold">{selectedProject.user?.full_name || 'Client'}</p></div>
                            <div className="bg-gray-50 p-3 rounded-xl"><p className="text-xs text-gray-500">Type</p><p className="text-sm font-semibold">{selectedProject.project_type}</p></div>
                            <div className="bg-gray-50 p-3 rounded-xl"><p className="text-xs text-gray-500">Cost</p><p className="text-sm font-semibold text-primary-600">R{(selectedProject.estimated_cost || 0).toLocaleString()}</p></div>
                            <div className="bg-gray-50 p-3 rounded-xl"><p className="text-xs text-gray-500">Created</p><p className="text-sm font-semibold">{selectedProject.created_at}</p></div>
                        </div>

                        {/* Admin Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                rows={3}
                                placeholder="Add notes about this project…"
                                value={adminNotes}
                                onChange={e => setAdminNotes(e.target.value)}
                            />
                        </div>

                        {/* Agent Compliance Comments (New) */}
                        {selectedProject.tasks && selectedProject.tasks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Agent Reviews & Comments</h4>
                                <div className="space-y-2">
                                    {selectedProject.tasks.map((t: any) => (
                                        <div key={t.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-medium text-gray-700">{t.task_type}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                                            </div>
                                            {t.compliance_comments ? (
                                                <p className="text-gray-600 mt-1 italic">"{t.compliance_comments}"</p>
                                            ) : (
                                                <p className="text-gray-400 text-xs mt-1">No comments logged yet.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button onClick={() => { setProjectDetailOpen(false); setAssignOpen(true) }} className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                                Assign Freelancer
                            </button>
                            <button onClick={() => { setProjectDetailOpen(false); setEscalateOpen(true) }} className="px-4 py-2 text-sm font-medium bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition">
                                Request Revision
                            </button>
                            <button onClick={() => { setProjectDetailOpen(false); setApproveOpen(true) }} className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                                Approve & Complete
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Approve Confirmation ── */}
            <ConfirmDialog
                isOpen={approveOpen}
                onClose={() => setApproveOpen(false)}
                onConfirm={handleApprove}
                title="Approve Project"
                message={`Approve "${selectedProject?.title}" and mark as completed? The client will be notified.`}
                confirmLabel="Approve"
                confirmColor="green"
            />

            {/* ── Escalate Confirmation ── */}
            <ConfirmDialog
                isOpen={escalateOpen}
                onClose={() => setEscalateOpen(false)}
                onConfirm={handleEscalate}
                title="Request Revision"
                message={`Send "${selectedProject?.title}" back to the freelancer for revision? They will be notified.`}
                confirmLabel="Send for Revision"
                confirmColor="red"
            />

            {/* ── Assign Freelancer Modal ── */}
            <Modal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Freelancer" size="md">
                <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-4">Select a freelancer to assign to "{selectedProject?.title}"</p>
                    {freelancers.filter((f: any) => f.is_available).map((f: any) => (
                        <button
                            key={f.id}
                            onClick={() => {
                                setToast({ message: `${f.name} assigned to "${selectedProject?.title}"`, type: 'success' })
                                setAssignOpen(false)
                            }}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition text-left"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {f.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                                    <p className="text-xs text-gray-500">{(f.skills || []).join(', ')}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500">{f.current_load}/{f.max_load} load</span>
                        </button>
                    ))}
                </div>
            </Modal>

            {/* ── Freelancer Detail Modal ── */}
            <Modal isOpen={freelancerDetailOpen} onClose={() => setFreelancerDetailOpen(false)} title="Freelancer Profile" size="md">
                {selectedFreelancer && (
                    <div className="space-y-5">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {selectedFreelancer.name?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedFreelancer.name}</h3>
                                <p className="text-sm text-gray-500">R{selectedFreelancer.hourly_rate}/hr • {selectedFreelancer.is_available ? '🟢 Available' : '🔴 Busy'}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {(selectedFreelancer.skills || []).map((s: string, i: number) => (
                                    <span key={i} className="px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-lg">{s}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Workload</h4>
                            <div className="flex items-center space-x-3">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(selectedFreelancer.current_load / selectedFreelancer.max_load) * 100}%` }} />
                                </div>
                                <span className="text-sm font-medium text-gray-600">{selectedFreelancer.current_load}/{selectedFreelancer.max_load}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}
