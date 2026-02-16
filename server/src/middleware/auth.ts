import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    role?: string;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ message: 'Missing authorization header' });
    }

    const token = header.replace('Bearer ', '');
    try {
        const payload = jwt.verify(token, jwtSecret) as { userId: string; role: string };
        req.userId = payload.userId;
        req.role = payload.role;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

export function authorizeRole(...roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.role || !roles.includes(req.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        return next();
    };
}
