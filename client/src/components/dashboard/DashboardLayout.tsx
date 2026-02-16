import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../ui/button';
import { clearAuth, loadAuth } from '../../lib/auth';

export interface NavItem {
    label: string;
    to: string;
}

interface DashboardLayoutProps {
    title: string;
    navItems: NavItem[];
    children: ReactNode;
}

export default function DashboardLayout({ title, navItems, children }: DashboardLayoutProps) {
    const auth = loadAuth();

    const handleLogout = () => {
        clearAuth();
        window.location.assign('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
            <header className="border-b bg-white dark:bg-gray-950">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="font-semibold">{auth?.name || auth?.email}</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        Log out
                    </Button>
                </div>
            </header>
            <div className="container mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[240px_1fr]">
                <aside className="bg-white dark:bg-gray-950 border rounded-lg p-4 space-y-2 h-fit">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `block rounded-md px-3 py-2 text-sm font-medium ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </aside>
                <section className="space-y-6">{children}</section>
            </div>
        </div>
    );
}
