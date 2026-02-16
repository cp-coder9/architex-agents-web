import { Navigate } from 'react-router-dom';
import { loadAuth } from '../../lib/auth';
import { getDashboardPath } from '../../lib/navigation';

export default function DashboardRouter() {
    const auth = loadAuth();

    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to={getDashboardPath(auth.role)} replace />;
}
