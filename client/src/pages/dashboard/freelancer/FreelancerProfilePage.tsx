import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { loadAuth } from '../../../lib/auth';

export default function FreelancerProfilePage() {
    const auth = loadAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Profile</h1>
                <p className="text-muted-foreground">Keep your contact details up to date.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Account details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Name: {auth?.name || 'Not set'}</p>
                    <p className="text-sm text-muted-foreground">Email: {auth?.email || 'Not set'}</p>
                    <p className="text-sm text-muted-foreground">Role: {auth?.role || 'Unknown'}</p>
                </CardContent>
            </Card>
        </div>
    );
}
