import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import type { NavItem } from '../../../components/dashboard/DashboardLayout';
import { fetchAdminProjects, fetchAdminTasks, fetchAdminUsers } from '../../../lib/api';
import type { Project, Task, User } from '../../../lib/api';
import { loadAuth } from '../../../lib/auth';

export interface AdminDashboardContext {
    projects: Project[];
    users: User[];
    tasks: Task[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const navItems: NavItem[] = [
    { label: 'Overview', to: '/dashboard/admin/overview' },
    { label: 'Projects', to: '/dashboard/admin/projects' },
    { label: 'Users', to: '/dashboard/admin/users' },
    { label: 'Tasks', to: '/dashboard/admin/tasks' },
];

export default function AdminDashboard() {
    const auth = useMemo(() => loadAuth(), []);
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAdminData = useCallback(async () => {
        if (!auth) return;
        setLoading(true);
        setError(null);
        try {
            const [projectsResponse, usersResponse, tasksResponse] = await Promise.all([
                fetchAdminProjects(auth.token),
                fetchAdminUsers(auth.token),
                fetchAdminTasks(auth.token),
            ]);
            setProjects(projectsResponse.projects);
            setUsers(usersResponse.users);
            setTasks(tasksResponse.tasks);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load admin data.');
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useEffect(() => {
        if (!auth) {
            navigate('/login');
            return;
        }
        if (auth.role !== 'ADMIN') {
            navigate('/dashboard');
            return;
        }
        loadAdminData();
    }, [auth, loadAdminData, navigate]);

    return (
        <DashboardLayout title="Admin Control Center" navItems={navItems}>
            <Outlet
                context={{
                    projects,
                    users,
                    tasks,
                    loading,
                    error,
                    refresh: loadAdminData,
                }}
            />
        </DashboardLayout>
    );
}
