import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useOutletContext } from 'react-router-dom';
import type { ClientDashboardContext } from './ClientDashboard';

export default function ClientOverviewPage() {
    const { projects, loading, error } = useOutletContext<ClientDashboardContext>();
    const totalDocuments = projects.reduce((count, project) => count + project.documents.length, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Overview</h1>
                <p className="text-muted-foreground">Track your active plan checks and drawings.</p>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Active Projects</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : projects.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Documents Uploaded</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : totalDocuments}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Compliance Status</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : 'Pending Review'}</CardTitle>
                    </CardHeader>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Next Actions</CardTitle>
                    <CardDescription>Upload plan files and monitor progress.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc ml-4 text-sm text-muted-foreground space-y-1">
                        <li>Add any missing plan files to keep the review moving.</li>
                        <li>Review comments from compliance agents when they arrive.</li>
                        <li>Reach out if you need a new drawing or amendment.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
