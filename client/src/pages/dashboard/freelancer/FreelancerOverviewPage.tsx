import { useOutletContext } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { FreelancerDashboardContext } from './FreelancerDashboard';

export default function FreelancerOverviewPage() {
    const { tasks, loading, error } = useOutletContext<FreelancerDashboardContext>();
    const activeTasks = tasks.filter((task) => task.status !== 'COMPLETED').length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Overview</h1>
                <p className="text-muted-foreground">Track assigned tasks and delivery deadlines.</p>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Total Tasks</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : tasks.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Active Tasks</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : activeTasks}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Next Deadline</CardDescription>
                        <CardTitle>{loading ? 'Loading...' : 'TBD'}</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
