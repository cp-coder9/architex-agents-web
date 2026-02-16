import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type Secret } from 'jsonwebtoken';
import db, { generateId, nowIso } from '../lib/db';

const router = Router();
const jwtSecret: Secret = process.env.JWT_SECRET || 'dev-secret';
const tokenExpiry = (process.env.JWT_EXPIRES_IN || '2h') as jwt.SignOptions['expiresIn'];

router.post('/register', async (req, res) => {
    const { email, password, name } = req.body as {
        email?: string;
        password?: string;
        name?: string;
    };

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existing = db
        .prepare('SELECT id FROM users WHERE email = ?')
        .get(email) as { id: string } | undefined;
    if (existing) {
        return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = generateId();
    const timestamp = nowIso();

    db.prepare(
        'INSERT INTO users (id, email, name, role, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(userId, email, name ?? null, 'CLIENT', hashedPassword, timestamp, timestamp);

    const token = jwt.sign({ userId, role: 'CLIENT' }, jwtSecret, { expiresIn: tokenExpiry });
    return res.status(201).json({
        token,
        user: {
            id: userId,
            email,
            name: name ?? null,
            role: 'CLIENT',
        },
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db
        .prepare('SELECT id, email, name, role, password FROM users WHERE email = ?')
        .get(email) as { id: string; email: string; name: string | null; role: string; password: string } | undefined;

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: tokenExpiry });
    return res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    });
});

export default router;
