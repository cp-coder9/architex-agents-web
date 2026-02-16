import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useOutletContext } from 'react-router-dom';
import type { ClientDashboardContext } from './ClientDashboard';
import { createProject, uploadDocument } from '../../../lib/api';
import { loadAuth } from '../../../lib/auth';

interface UploadStatus {
    [projectId: string]: string;
}

export default function ClientProjectsPage() {
    const auth = loadAuth();
    const { projects, loading, error, refresh } = useOutletContext<ClientDashboardContext>();
    const [newProject, setNewProject] = useState({ title: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});

    const handleCreateProject = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!auth) return;

        setCreating(true);
        setFormError(null);

        try {
            await createProject(auth.token, {
                title: newProject.title,
                description: newProject.description || undefined,
            });
            setNewProject({ title: '', description: '' });
            await refresh();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Unable to create project.');
        } finally {
            setCreating(false);
        }
    };

    const handleUpload = async (projectId: string, file: File | null) => {
        if (!auth || !file) return;

        setUploadStatus((prev) => ({ ...prev, [projectId]: 'Uploading...' }));
        try {
            await uploadDocument(auth.token, projectId, file);
            setUploadStatus((prev) => ({ ...prev, [projectId]: 'Upload complete' }));
            await refresh();
        } catch (err) {
            setUploadStatus((prev) => ({
                ...prev,
                [projectId]: err instanceof Error ? err.message : 'Upload failed',
            }));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Projects</h1>
                <p className="text-muted-foreground">Create projects and upload plan files.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create a new project</CardTitle>
                    <CardDescription>Start a compliance check or drawing request.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateProject} className="grid gap-4 md:grid-cols-[2fr_3fr_auto]">
                        <Input
                            placeholder="Project title"
                            required
                            value={newProject.title}
                            onChange={(event) => setNewProject({ ...newProject, title: event.target.value })}
                        />
                        <Input
                            placeholder="Short description or address (optional)"
                            value={newProject.description}
                            onChange={(event) => setNewProject({ ...newProject, description: event.target.value })}
                        />
                        <Button type="submit" disabled={creating}>
                            {creating ? 'Creating...' : 'Create project'}
                        </Button>
                    </form>
                    {formError && <p className="text-sm text-red-500 mt-3">{formError}</p>}
                </CardContent>
            </Card>

            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-muted-foreground">Loading projects...</p>}
            {!loading && projects.length === 0 && (
                <p className="text-muted-foreground">No projects yet. Create one to get started.</p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                    <Card key={project.id}>
                        <CardHeader>
                            <CardTitle>{project.title}</CardTitle>
                            <CardDescription>Status: {project.status.replace('_', ' ')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {project.description && (
                                <p className="text-sm text-muted-foreground">{project.description}</p>
                            )}
                            <div>
                                <label className="text-sm font-medium">Upload plan files</label>
                                <Input
                                    type="file"
                                    className="mt-2"
                                    onChange={(event) => handleUpload(project.id, event.target.files?.[0] ?? null)}
                                />
                                {uploadStatus[project.id] && (
                                    <p className="text-xs text-muted-foreground mt-1">{uploadStatus[project.id]}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Documents</p>
                                {project.documents.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No documents uploaded.</p>
                                ) : (
                                    <ul className="text-sm text-muted-foreground list-disc ml-4">
                                        {project.documents.map((document) => (
                                            <li key={document.id}>{document.filename}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
