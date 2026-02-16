import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import type { NavItem } from '../../../components/dashboard/DashboardLayout';
import { fetchProjects } from '../../../lib/api';
import type { Project } from '../../../lib/api';
import { loadAuth } from '../../../lib/auth';

export interface ClientDashboardContext {
    projects: Project[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const navItems: NavItem[] = [
    { label: 'Overview', to: '/dashboard/client/overview' },
    { label: 'Projects', to: '/dashboard/client/projects' },
    { label: 'Documents', to: '/dashboard/client/documents' },
];

export default function ClientDashboard() {
    const auth = useMemo(() => loadAuth(), []);
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        if (!auth) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetchProjects(auth.token);
            setProjects(response.projects);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load projects.');
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useEffect(() => {
        if (!auth) {
            navigate('/login');
            return;
        }
        loadProjects();
    }, [auth, loadProjects, navigate]);

    return (
        <DashboardLayout title="Client Dashboard" navItems={navItems}>
            <Outlet
                context={{
                    projects,
                    loading,
                    error,
                    refresh: loadProjects,
                }}
            />
        </DashboardLayout>
    );
}
