import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import type { NavItem } from '../../../components/dashboard/DashboardLayout';
import { fetchFreelancerTasks } from '../../../lib/api';
import type { Task } from '../../../lib/api';
import { loadAuth } from '../../../lib/auth';

export interface FreelancerDashboardContext {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const navItems: NavItem[] = [
    { label: 'Overview', to: '/dashboard/freelancer/overview' },
    { label: 'Tasks', to: '/dashboard/freelancer/tasks' },
    { label: 'Profile', to: '/dashboard/freelancer/profile' },
];

export default function FreelancerDashboard() {
    const auth = useMemo(() => loadAuth(), []);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTasks = useCallback(async () => {
        if (!auth) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetchFreelancerTasks(auth.token);
            setTasks(response.tasks);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load tasks.');
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useEffect(() => {
        if (!auth) {
            navigate('/login');
            return;
        }
        if (auth.role !== 'FREELANCER') {
            navigate('/dashboard');
            return;
        }
        loadTasks();
    }, [auth, loadTasks, navigate]);

    return (
        <DashboardLayout title="Freelancer Workspace" navItems={navItems}>
            <Outlet
                context={{
                    tasks,
                    loading,
                    error,
                    refresh: loadTasks,
                }}
            />
        </DashboardLayout>
    );
}
