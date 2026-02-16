import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db, { generateId, nowIso } from '../lib/db';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorizeRole('ADMIN'));

const projectStatuses = ['PENDING_REVIEW', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT', 'COMPLETED'];
const userRoles = ['CLIENT', 'ADMIN', 'FREELANCER'];

router.get('/projects', async (_req, res) => {
    const projects = db
        .prepare(
            `
            SELECT projects.*, users.id as clientId, users.email as clientEmail, users.name as clientName, users.role as clientRole, users.createdAt as clientCreatedAt
            FROM projects
            JOIN users ON users.id = projects.clientId
            ORDER BY projects.createdAt DESC
        `,
        )
        .all() as Array<{
        id: string;
        title: string;
        description: string | null;
        status: string;
        clientId: string;
        createdAt: string;
        updatedAt: string;
        clientEmail: string;
        clientName: string | null;
        clientRole: string;
        clientCreatedAt: string;
    }>;

    const documentStmt = db.prepare('SELECT * FROM documents WHERE projectId = ? ORDER BY createdAt DESC');

    const response = projects.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        clientId: project.clientId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        documents: documentStmt.all(project.id),
        client: {
            id: project.clientId,
            email: project.clientEmail,
            name: project.clientName,
            role: project.clientRole,
            createdAt: project.clientCreatedAt,
        },
    }));

    return res.json({ projects: response });
});

router.patch('/projects/:projectId/status', async (req, res) => {
    const { projectId } = req.params;
    const { status } = req.body as { status?: string };

    if (!status || !projectStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    const timestamp = nowIso();
    const updated = db
        .prepare('UPDATE projects SET status = ?, updatedAt = ? WHERE id = ?')
        .run(status, timestamp, projectId);

    if (updated.changes === 0) {
        return res.status(404).json({ message: 'Project not found.' });
    }

    const project = db
        .prepare(
            `
            SELECT projects.*, users.id as clientId, users.email as clientEmail, users.name as clientName, users.role as clientRole, users.createdAt as clientCreatedAt
            FROM projects
            JOIN users ON users.id = projects.clientId
            WHERE projects.id = ?
        `,
        )
        .get(projectId) as {
        id: string;
        title: string;
        description: string | null;
        status: string;
        clientId: string;
        createdAt: string;
        updatedAt: string;
        clientEmail: string;
        clientName: string | null;
        clientRole: string;
        clientCreatedAt: string;
    };

    const documents = db
        .prepare('SELECT * FROM documents WHERE projectId = ? ORDER BY createdAt DESC')
        .all(projectId);

    return res.json({
        project: {
            id: project.id,
            title: project.title,
            description: project.description,
            status: project.status,
            clientId: project.clientId,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            documents,
            client: {
                id: project.clientId,
                email: project.clientEmail,
                name: project.clientName,
                role: project.clientRole,
                createdAt: project.clientCreatedAt,
            },
        },
    });
});

router.get('/users', async (_req, res) => {
    const users = db
        .prepare('SELECT id, email, name, role, createdAt FROM users ORDER BY createdAt DESC')
        .all();

    return res.json({ users });
});

router.post('/users', async (req, res) => {
    const { email, password, name, role } = req.body as {
        email?: string;
        password?: string;
        name?: string;
        role?: string;
    };

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (role && !userRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role value.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;
    if (existing) {
        return res.status(409).json({ message: 'Email already registered.' });
    }

    const userId = generateId();
    const timestamp = nowIso();
    const hashedPassword = await bcrypt.hash(password, 12);

    db.prepare(
        'INSERT INTO users (id, email, name, role, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(userId, email, name ?? null, role ?? 'CLIENT', hashedPassword, timestamp, timestamp);

    const user = db
        .prepare('SELECT id, email, name, role, createdAt FROM users WHERE id = ?')
        .get(userId);

    return res.status(201).json({ user });
});

router.get('/tasks', async (_req, res) => {
    const tasks = db
        .prepare(
            `
            SELECT tasks.*, projects.title as projectTitle, users.id as assignedUserId, users.email as assignedEmail, users.name as assignedName, users.role as assignedRole, users.createdAt as assignedCreatedAt
            FROM tasks
            LEFT JOIN projects ON projects.id = tasks.projectId
            LEFT JOIN users ON users.id = tasks.assignedToId
            ORDER BY tasks.createdAt DESC
        `,
        )
        .all() as Array<{
        id: string;
        title: string;
        description: string | null;
        status: string;
        projectId: string | null;
        assignedToId: string | null;
        createdAt: string;
        updatedAt: string;
        projectTitle: string | null;
        assignedUserId: string | null;
        assignedEmail: string | null;
        assignedName: string | null;
        assignedRole: string | null;
        assignedCreatedAt: string | null;
    }>;

    const response = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: task.projectId,
        assignedToId: task.assignedToId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        project: task.projectId
            ? {
                  id: task.projectId,
                  title: task.projectTitle,
              }
            : null,
        assignedTo: task.assignedToId
            ? {
                  id: task.assignedToId,
                  email: task.assignedEmail,
                  name: task.assignedName,
                  role: task.assignedRole,
                  createdAt: task.assignedCreatedAt,
              }
            : null,
    }));

    return res.json({ tasks: response });
});

router.post('/tasks', async (req, res) => {
    const { title, description, projectId, assignedToId } = req.body as {
        title?: string;
        description?: string;
        projectId?: string;
        assignedToId?: string;
    };

    if (!title) {
        return res.status(400).json({ message: 'Title is required.' });
    }

    if (projectId) {
        const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId) as { id: string } | undefined;
        if (!project) {
            return res.status(400).json({ message: 'Project not found.' });
        }
    }

    if (assignedToId) {
        const assignee = db
            .prepare('SELECT id, role FROM users WHERE id = ?')
            .get(assignedToId) as { id: string; role: string } | undefined;
        if (!assignee || assignee.role !== 'FREELANCER') {
            return res.status(400).json({ message: 'Assigned user must be a freelancer.' });
        }
    }

    const taskId = generateId();
    const timestamp = nowIso();

    db.prepare(
        'INSERT INTO tasks (id, title, description, status, projectId, assignedToId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(taskId, title, description ?? null, 'ASSIGNED', projectId ?? null, assignedToId ?? null, timestamp, timestamp);

    const task = db
        .prepare(
            `
            SELECT tasks.*, projects.title as projectTitle, users.id as assignedUserId, users.email as assignedEmail, users.name as assignedName, users.role as assignedRole, users.createdAt as assignedCreatedAt
            FROM tasks
            LEFT JOIN projects ON projects.id = tasks.projectId
            LEFT JOIN users ON users.id = tasks.assignedToId
            WHERE tasks.id = ?
        `,
        )
        .get(taskId) as {
        id: string;
        title: string;
        description: string | null;
        status: string;
        projectId: string | null;
        assignedToId: string | null;
        createdAt: string;
        updatedAt: string;
        projectTitle: string | null;
        assignedUserId: string | null;
        assignedEmail: string | null;
        assignedName: string | null;
        assignedRole: string | null;
        assignedCreatedAt: string | null;
    };

    return res.status(201).json({
        task: {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            projectId: task.projectId,
            assignedToId: task.assignedToId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            project: task.projectId
                ? {
                      id: task.projectId,
                      title: task.projectTitle,
                  }
                : null,
            assignedTo: task.assignedToId
                ? {
                      id: task.assignedToId,
                      email: task.assignedEmail,
                      name: task.assignedName,
                      role: task.assignedRole,
                      createdAt: task.assignedCreatedAt,
                  }
                : null,
        },
    });
});

export default router;
