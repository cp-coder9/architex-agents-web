import { useOutletContext } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { AdminDashboardContext } from './AdminDashboard';

export default function AdminOverviewPage() {
    const { projects, users, tasks, loading, error } = useOutletContext<AdminDashboardContext>();
    const clientCount = users.filter((user) => user.role === 'CLIENT').length;
    const freelancerCount = users.filter((user) => user.role === 'FREELANCER').length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Overview</h1>
                <p className="text-muted-foreground">System-wide visibility across projects and users.</p>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardDescription>Total Projects</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : projects.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Clients</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : clientCount}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Freelancers</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : freelancerCount}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Active Tasks</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : tasks.length}</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
