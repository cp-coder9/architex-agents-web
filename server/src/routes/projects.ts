import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import db, { generateId, nowIso } from '../lib/db';

const uploadDirectory = path.resolve(process.cwd(), 'server', 'uploads');

const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
        const safeName = file.originalname.replace(/\s+/g, '-');
        const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(null, `${uniquePrefix}-${safeName}`);
    },
});

const upload = multer({ storage });

const router = Router();

router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const projects = db
        .prepare('SELECT * FROM projects WHERE clientId = ? ORDER BY createdAt DESC')
        .all(req.userId) as Array<{
        id: string;
        title: string;
        description: string | null;
        status: string;
        clientId: string;
        createdAt: string;
        updatedAt: string;
    }>;

    const documentStmt = db.prepare('SELECT * FROM documents WHERE projectId = ? ORDER BY createdAt DESC');

    const result = projects.map((project) => ({
        ...project,
        documents: documentStmt.all(project.id) as Array<{
            id: string;
            filename: string;
            type: string;
            url: string;
            projectId: string;
            createdAt: string;
        }>,
    }));

    return res.json({ projects: result });
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description } = req.body as { title?: string; description?: string };
    if (!title) {
        return res.status(400).json({ message: 'Title is required.' });
    }

    const projectId = generateId();
    const timestamp = nowIso();

    db.prepare(
        'INSERT INTO projects (id, title, description, status, clientId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(projectId, title, description ?? null, 'PENDING_REVIEW', req.userId, timestamp, timestamp);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    return res.status(201).json({ project });
});

router.post(
    '/:projectId/documents',
    authenticate,
    upload.single('file'),
    async (req: AuthenticatedRequest, res) => {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { projectId } = req.params;
        if (!req.file) {
            return res.status(400).json({ message: 'File is required.' });
        }

        const project = db
            .prepare('SELECT id FROM projects WHERE id = ? AND clientId = ?')
            .get(projectId, req.userId) as { id: string } | undefined;

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const documentId = generateId();
        const timestamp = nowIso();

        db.prepare(
            'INSERT INTO documents (id, filename, type, url, projectId, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        ).run(
            documentId,
            req.file.originalname,
            path.extname(req.file.originalname).replace('.', '').toUpperCase() || 'UNKNOWN',
            `/uploads/${req.file.filename}`,
            projectId,
            timestamp,
        );

        const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);
        return res.status(201).json({ document });
    },
);

export default router;
