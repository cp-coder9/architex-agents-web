import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import Modal, { ConfirmDialog, Toast } from '../components/Modal'
import * as api from '../lib/api'

// Define the shape of our timer state
interface ActiveTimer {
    id: number
    taskId: number
    startedAt: Date
    elapsed: number // in seconds
}

export default function FreelancerDashboard() {
    const [activeTab, setActiveTab] = useState('tasks')
    const [tasks, setTasks] = useState<any[]>([])
    const [marketTasks, setMarketTasks] = useState<any[]>([])
    const [logs, setLogs] = useState<any[]>([])
    const [earnings, setEarnings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null)

    // Modals
    const [stopModalOpen, setStopModalOpen] = useState(false)
    const [stopNotes, setStopNotes] = useState('')

    // Hardcoded freelancer ID for demo (in prod, get from auth context)
    const FREELANCER_ID = 1

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            // Parallel fetch: tasks, earnings, active timer, logs, market tasks
            const [tasksRes, earningsRes, timerRes, logsRes, marketRes] = await Promise.allSettled([
                api.freelancers.myTasks(FREELANCER_ID),
                api.freelancers.earnings(FREELANCER_ID),
                api.time.getActive(FREELANCER_ID),
                api.time.getFreelancerLogs(FREELANCER_ID),
                api.freelancers.availableTasks(),
            ])

            if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.tasks || [])
            if (earningsRes.status === 'fulfilled') setEarnings(earningsRes.value)
            if (marketRes.status === 'fulfilled') setMarketTasks(marketRes.value.tasks || [])

            // Handle Active Timer
            if (timerRes.status === 'fulfilled' && timerRes.value.active) {
                const t = timerRes.value
                setActiveTimer({
                    id: t.time_log_id,
                    taskId: t.task_id,
                    startedAt: new Date(t.started_at),
                    elapsed: t.elapsed_seconds
                })
            }

            if (logsRes.status === 'fulfilled') setLogs(logsRes.value.logs || [])

        } catch (err) {
            console.error("Dashboard load error", err)
            setToast({ message: "Failed to load dashboard data", type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [])

    const handleAcceptTask = async (taskId: number) => {
        if (!confirm("Are you sure you want to accept this task? It will be moved to your 'My Tasks' list.")) return
        try {
            await api.freelancers.acceptTask(taskId, FREELANCER_ID)
            setToast({ message: "Task accepted! You can now start working.", type: 'success' })
            setActiveTab('tasks')
            loadData()
        } catch (err: any) {
            setToast({ message: err.message || "Failed to accept task", type: 'error' })
        }
    }

    useEffect(() => { loadData() }, [loadData])

    // Timer Tick
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (activeTimer) {
            interval = setInterval(() => {
                setActiveTimer(prev => prev ? { ...prev, elapsed: prev.elapsed + 1 } : null)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [activeTimer])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const handleStartTimer = async (taskId: number) => {
        try {
            const res = await api.time.start(taskId, FREELANCER_ID)
            setActiveTimer({
                id: res.time_log_id,
                taskId: taskId,
                startedAt: new Date(res.started_at),
                elapsed: 0
            })
            setToast({ message: "Timer started", type: 'success' })
        } catch (err: any) {
            setToast({ message: err.message || "Failed to start timer", type: 'error' })
        }
    }

    const handleStopTimer = async () => {
        if (!activeTimer) return
        try {
            await api.time.stop(activeTimer.id, stopNotes)
            setActiveTimer(null)
            setStopModalOpen(false)
            setStopNotes('')
            setToast({ message: "Timer stopped & logged", type: 'success' })
            loadData() // Refresh logs and hours
        } catch (err: any) {
            setToast({ message: err.message || "Failed to stop timer", type: 'error' })
        }
    }

    const activeTask = tasks.find(t => t.id === activeTimer?.taskId)

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Head>
                <title>Freelancer Workspace – Architex Axis</title>
            </Head>

            {/* ── Active Timer Bar (Sticky Top) ── */}
            {activeTimer && (
                <div className="sticky top-16 z-40 bg-gray-900 text-white shadow-lg border-b border-gray-800 animate-slideDown">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tracking Time</p>
                                <div className="flex items-center space-x-2">
                                    <span className="font-mono text-xl font-bold text-white">{formatTime(activeTimer.elapsed)}</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-sm text-gray-300 font-medium truncate max-w-[200px] md:max-w-md">
                                        {activeTask ? `Task #${activeTask.id} – ${activeTask.task_type}` : 'Loading task...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setStopModalOpen(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition shadow-sm flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                            <span>Stop Timer</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Freelancer Workspace</h1>
                <p className="text-gray-500 mb-8">Manage tasks, track billable hours, and view earnings.</p>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Earnings</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">R{(earnings?.total_earnings || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase">Pending Payout</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">R{(earnings?.pending_payout || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase">Hours Logged</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{logs.reduce((acc, log) => acc + (log.duration_seconds || 0), 0) / 3600 | 0}h</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase">Active Tasks</p>
                        <p className="text-2xl font-bold text-primary-600 mt-1">{tasks.filter(t => t.status === 'in_progress').length}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
                    <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'tasks' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>My Tasks</button>
                    <button onClick={() => setActiveTab('marketplace')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'marketplace' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>Marketplace</button>
                    <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'logs' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>Time Logs</button>
                </div>

                {/* ── TASKS LIST ── */}
                {activeTab === 'tasks' && (
                    <div className="space-y-4">
                        {tasks.filter(t => t.status !== 'completed').map(task => {
                            const purchased = task.purchased_hours || 0
                            const used = task.hours_used || 0
                            const progress = purchased > 0 ? (used / purchased) * 100 : 0
                            const isRunning = activeTimer?.taskId === task.id

                            return (
                                <div key={task.id} className={`bg-white rounded-xl border p-6 transition flex items-center justify-between ${isRunning ? 'border-primary-200 shadow-lg ring-1 ring-primary-100' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase">{task.task_type}</span>
                                            <span className="text-sm text-gray-400">Task #{task.id}</span>
                                        </div>

                                        <div className="flex items-center space-x-8 mt-4">
                                            {/* Hours Progress */}
                                            <div className="w-48">
                                                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                                                    <span>{used.toFixed(1)}h used</span>
                                                    <span>{purchased.toFixed(1)}h purchased</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${progress > 100 ? 'bg-red-500' : progress > 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Status</p>
                                                <p className="text-sm font-semibold text-gray-900">{task.status}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="ml-6 flex items-center space-x-3">
                                        {isRunning ? (
                                            <button
                                                onClick={() => setStopModalOpen(true)}
                                                className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
                                            >
                                                <div className="w-3 h-3 bg-red-600 rounded-sm mb-1" />
                                                <span className="text-xs font-bold">STOP</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleStartTimer(task.id)}
                                                disabled={!!activeTimer} // Disable if another timer acts
                                                className={`flex flex-col items-center justify-center w-20 h-20 rounded-full transition border ${activeTimer
                                                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                                    : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200 hover:scale-105 hover:shadow-lg'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                <span className="text-xs font-bold">START</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {tasks.length === 0 && <div className="text-center py-12 text-gray-400">No active tasks assigned yet.</div>}
                    </div>
                )}

                {/* ── MARKETPLACE TAB ── */}
                {activeTab === 'marketplace' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-bold text-blue-900 mb-2">Available Opportunities</h3>
                            <p className="text-blue-700">Browse and accept open tasks. Once accepted, start the timer to begin billing.</p>
                        </div>

                        {marketTasks.map(task => (
                            <div key={task.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition flex items-center justify-between">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 uppercase">{task.task_type}</span>
                                        <span className="text-sm text-gray-400">Available Task #{task.id}</span>
                                    </div>
                                    <p className="text-gray-900 font-medium text-lg mt-1">Project ID: {task.project_id}</p>
                                    <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>{task.purchased_hours || 0}h Budgeted</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>Est. Earnings: R{((task.purchased_hours || 0) * 450).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAcceptTask(task.id)}
                                    className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Accept Task
                                </button>
                            </div>
                        ))}

                        {marketTasks.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                <p className="text-gray-500 font-medium">No open tasks available right now.</p>
                                <p className="text-gray-400 text-sm mt-1">Check back later or contact admin.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'logs' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.started_at).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(log.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Task #{log.task_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{log.duration_display || 'Running...'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.notes || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${log.stopped_at ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 animate-pulse'}`}>
                                                {log.stopped_at ? 'Logged' : 'Running'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length === 0 && <div className="text-center py-12 text-gray-400">No time logs recorded yet.</div>}
                    </div>
                )}
            </div>

            {/* ── Stop Timer Modal ── */}
            <Modal isOpen={stopModalOpen} onClose={() => setStopModalOpen(false)} title="Stop Timer & Log Session">
                <div className="space-y-4">
                    <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Session Duration</span>
                        <span className="text-2xl font-mono font-bold text-gray-900">{activeTimer ? formatTime(activeTimer.elapsed) : '00:00:00'}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session Notes (Private)</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            rows={3}
                            placeholder="What did you work on during this session?"
                            value={stopNotes}
                            onChange={e => setStopNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={() => setStopModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={handleStopTimer} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition">
                            Stop & Save
                        </button>
                    </div>
                </div>
            </Modal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}
