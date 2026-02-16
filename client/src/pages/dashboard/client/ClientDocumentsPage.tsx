import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useOutletContext } from 'react-router-dom';
import type { ClientDashboardContext } from './ClientDashboard';

export default function ClientDocumentsPage() {
    const { projects, loading, error } = useOutletContext<ClientDashboardContext>();
    const documents = projects.flatMap((project) =>
        project.documents.map((doc) => ({ ...doc, projectTitle: project.title })),
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Documents</h1>
                <p className="text-muted-foreground">All plan files uploaded to your projects.</p>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-muted-foreground">Loading documents...</p>}
            {!loading && documents.length === 0 && (
                <p className="text-muted-foreground">No documents uploaded yet.</p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
                {documents.map((document) => (
                    <Card key={document.id}>
                        <CardHeader>
                            <CardTitle>{document.filename}</CardTitle>
                            <CardDescription>{document.projectTitle}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Type: {document.type}</p>
                            <a
                                href={document.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary underline"
                            >
                                View document
                            </a>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
