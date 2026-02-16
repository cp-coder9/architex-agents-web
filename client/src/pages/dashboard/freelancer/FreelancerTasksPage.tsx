import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { FreelancerDashboardContext } from './FreelancerDashboard';
import { updateTaskStatus } from '../../../lib/api';
import { loadAuth } from '../../../lib/auth';

const statusOptions = ['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED'];

export default function FreelancerTasksPage() {
    const auth = loadAuth();
    const { tasks, loading, error, refresh } = useOutletContext<FreelancerDashboardContext>();
    const [updating, setUpdating] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleStatusChange = async (taskId: string, status: string) => {
        if (!auth) return;
        setUpdating(taskId);
        setMessage(null);
        try {
            await updateTaskStatus(auth.token, taskId, status);
            await refresh();
            setMessage('Task status updated.');
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to update task.');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Tasks</h1>
                <p className="text-muted-foreground">Update your task statuses as you progress.</p>
            </div>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-muted-foreground">Loading tasks...</p>}
            {!loading && tasks.length === 0 && (
                <p className="text-muted-foreground">No assigned tasks yet.</p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
                {tasks.map((task) => (
                    <Card key={task.id}>
                        <CardHeader>
                            <CardTitle>{task.title}</CardTitle>
                            <CardDescription>
                                Project: {task.project?.title || 'Unlinked'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {task.description && (
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                            <label className="text-sm font-medium">Status</label>
                            <select
                                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={task.status}
                                onChange={(event) => handleStatusChange(task.id, event.target.value)}
                                disabled={updating === task.id}
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
