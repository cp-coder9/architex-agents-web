import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { AdminDashboardContext } from './AdminDashboard';
import { createAdminUser } from '../../../lib/api';
import { loadAuth } from '../../../lib/auth';

const roleOptions = ['CLIENT', 'FREELANCER', 'ADMIN'];

export default function AdminUsersPage() {
    const auth = loadAuth();
    const { users, loading, error, refresh } = useOutletContext<AdminDashboardContext>();
    const [formState, setFormState] = useState({ name: '', email: '', password: '', role: 'CLIENT' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!auth) return;
        setSubmitting(true);
        setMessage(null);
        try {
            await createAdminUser(auth.token, formState);
            setFormState({ name: '', email: '', password: '', role: 'CLIENT' });
            setMessage('User created successfully.');
            await refresh();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to create user.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Users</h1>
                <p className="text-muted-foreground">Manage client, freelancer, and admin accounts.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create new user</CardTitle>
                    <CardDescription>Provision accounts for your team or clients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                        <Input
                            placeholder="Full name"
                            value={formState.name}
                            onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                        />
                        <Input
                            type="email"
                            placeholder="Email address"
                            required
                            value={formState.email}
                            onChange={(event) => setFormState({ ...formState, email: event.target.value })}
                        />
                        <Input
                            type="password"
                            placeholder="Temporary password"
                            required
                            value={formState.password}
                            onChange={(event) => setFormState({ ...formState, password: event.target.value })}
                        />
                        <select
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formState.role}
                            onChange={(event) => setFormState({ ...formState, role: event.target.value })}
                        >
                            {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create user'}
                        </Button>
                    </form>
                    {message && <p className="text-sm text-muted-foreground mt-3">{message}</p>}
                </CardContent>
            </Card>

            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-muted-foreground">Loading users...</p>}
            {!loading && users.length === 0 && <p className="text-muted-foreground">No users yet.</p>}
            <div className="grid gap-4 md:grid-cols-2">
                {users.map((user) => (
                    <Card key={user.id}>
                        <CardHeader>
                            <CardTitle>{user.name || 'Unnamed user'}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Role: {user.role}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
