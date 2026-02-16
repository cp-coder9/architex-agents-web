import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import type { AdminDashboardContext } from './AdminDashboard';
import { loadAuth } from '../../../lib/auth';
import { updateProjectStatus } from '../../../lib/api';
import { useState } from 'react';

const statusOptions = [
    'PENDING_REVIEW',
    'IN_PROGRESS',
    'COMPLIANT',
    'NON_COMPLIANT',
    'COMPLETED',
];

export default function AdminProjectsPage() {
    const auth = loadAuth();
    const { projects, loading, error, refresh } = useOutletContext<AdminDashboardContext>();
    const [updating, setUpdating] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleStatusChange = async (projectId: string, status: string) => {
        if (!auth) return;
        setUpdating(projectId);
        setMessage(null);
        try {
            await updateProjectStatus(auth.token, projectId, status);
            await refresh();
            setMessage('Project status updated.');
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to update status.');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Projects</h1>
                <p className="text-muted-foreground">Monitor all client projects and update statuses.</p>
            </div>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-muted-foreground">Loading projects...</p>}
            {!loading && projects.length === 0 && (
                <p className="text-muted-foreground">No projects created yet.</p>
            )}
            <div className="grid gap-4">
                {projects.map((project) => (
                    <Card key={project.id}>
                        <CardHeader>
                            <CardTitle>{project.title}</CardTitle>
                            <CardDescription>
                                Client: {project.client?.name || project.client?.email || 'Unknown'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {project.description && (
                                <p className="text-sm text-muted-foreground">{project.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={project.status}
                                    onChange={(event) => handleStatusChange(project.id, event.target.value)}
                                    disabled={updating === project.id}
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                                <Button variant="outline" size="sm" disabled>
                                    {project.documents.length} document(s)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
