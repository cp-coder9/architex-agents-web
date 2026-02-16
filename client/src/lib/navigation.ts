export function getDashboardPath(role?: string) {
    switch (role) {
        case 'ADMIN':
            return '/dashboard/admin/overview';
        case 'FREELANCER':
            return '/dashboard/freelancer/overview';
        case 'CLIENT':
        default:
            return '/dashboard/client/overview';
    }
}
