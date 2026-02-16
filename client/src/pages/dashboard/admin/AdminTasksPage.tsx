import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { AdminDashboardContext } from './AdminDashboard';
import { createAdminTask } from '../../../lib/api';
import { loadAuth } from '../../../lib/auth';

export default function AdminTasksPage() {
    const auth = loadAuth();
    const { tasks, projects, users, loading, error, refresh } = useOutletContext<AdminDashboardContext>();
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        projectId: '',
        assignedToId: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!auth) return;
        setSubmitting(true);
        setMessage(null);
        try {
            await createAdminTask(auth.token, {
                title: formState.title,
                description: formState.description || undefined,
                projectId: formState.projectId || undefined,
                assignedToId: formState.assignedToId || undefined,
            });
            setFormState({ title: '', description: '', projectId: '', assignedToId: '' });
            setMessage('Task created successfully.');
            await refresh();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to create task.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Tasks</h1>
                <p className="text-muted-foreground">Assign work items to freelancers.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create task</CardTitle>
                    <CardDescription>Send drawing or compliance tasks to freelancers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                        <Input
                            placeholder="Task title"
                            required
                            value={formState.title}
                            onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                        />
                        <Input
                            placeholder="Short description"
                            value={formState.description}
                            onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                        />
                        <select
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formState.projectId}
                            onChange={(event) => setFormState({ ...formState, projectId: event.target.value })}
                        >
                            <option value="">Link to project (optional)</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.title}
                                </option>
                            ))}
                        </select>
                        <select
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formState.assignedToId}
                            onChange={(event) => setFormState({ ...formState, assignedToId: event.target.value })}
                        >
                            <option value="">Assign freelancer (optional)</option>
                            {users
                                .filter((user) => user.role === 'FREELANCER')
                                .map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name || user.email}
                                    </option>
                                ))}
                        </select>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create task'}
                        </Button>
                    </form>
                    {message && <p className="text-sm text-muted-foreground mt-3">{message}</p>}
                </CardContent>
            </Card>

            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-muted-foreground">Loading tasks...</p>}
            {!loading && tasks.length === 0 && <p className="text-muted-foreground">No tasks yet.</p>}
            <div className="grid gap-4 md:grid-cols-2">
                {tasks.map((task) => (
                    <Card key={task.id}>
                        <CardHeader>
                            <CardTitle>{task.title}</CardTitle>
                            <CardDescription>Status: {task.status.replace('_', ' ')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {task.description && (
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Project: {task.project?.title || 'Unlinked'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Assigned to: {task.assignedTo?.name || task.assignedTo?.email || 'Unassigned'}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
