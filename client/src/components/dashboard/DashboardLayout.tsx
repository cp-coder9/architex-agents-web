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
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b bg-primary text-primary-foreground shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-primary-foreground/80">{title}</p>
                        <p className="font-black text-primary-foreground">{auth?.name || auth?.email}</p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-primary-foreground/40 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        onClick={handleLogout}
                    >
                        Log out
                    </Button>
                </div>
            </header>
            <div className="container mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[240px_1fr]">
                <aside className="border rounded-lg p-4 space-y-2 h-fit bg-primary text-primary-foreground shadow-sm">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `block rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                                    isActive
                                        ? 'bg-white text-primary'
                                        : 'text-primary-foreground/90 hover:bg-primary-foreground/15 hover:text-primary-foreground'
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
