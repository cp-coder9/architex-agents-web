import { Router } from 'express';
import db, { nowIso } from '../lib/db';
import { authenticate, authorizeRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorizeRole('FREELANCER'));

const taskStatuses = ['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED'];

router.get('/tasks', async (req: AuthenticatedRequest, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const tasks = db
        .prepare(
            `
            SELECT tasks.*, projects.title as projectTitle
            FROM tasks
            LEFT JOIN projects ON projects.id = tasks.projectId
            WHERE tasks.assignedToId = ?
            ORDER BY tasks.createdAt DESC
        `,
        )
        .all(req.userId) as Array<{
        id: string;
        title: string;
        description: string | null;
        status: string;
        projectId: string | null;
        assignedToId: string;
        createdAt: string;
        updatedAt: string;
        projectTitle: string | null;
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
        assignedTo: {
            id: task.assignedToId,
        },
    }));

    return res.json({ tasks: response });
});

router.patch('/tasks/:taskId/status', async (req: AuthenticatedRequest, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { taskId } = req.params;
    const { status } = req.body as { status?: string };

    if (!status || !taskStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    const task = db
        .prepare('SELECT id FROM tasks WHERE id = ? AND assignedToId = ?')
        .get(taskId, req.userId) as { id: string } | undefined;

    if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
    }

    const timestamp = nowIso();
    db.prepare('UPDATE tasks SET status = ?, updatedAt = ? WHERE id = ?').run(status, timestamp, taskId);

    const updated = db
        .prepare(
            `
            SELECT tasks.*, projects.title as projectTitle
            FROM tasks
            LEFT JOIN projects ON projects.id = tasks.projectId
            WHERE tasks.id = ?
        `,
        )
        .get(taskId) as {
        id: string;
        title: string;
        description: string | null;
        status: string;
        projectId: string | null;
        assignedToId: string;
        createdAt: string;
        updatedAt: string;
        projectTitle: string | null;
    };

    return res.json({
        task: {
            id: updated.id,
            title: updated.title,
            description: updated.description,
            status: updated.status,
            projectId: updated.projectId,
            assignedToId: updated.assignedToId,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            project: updated.projectId
                ? {
                      id: updated.projectId,
                      title: updated.projectTitle,
                  }
                : null,
            assignedTo: {
                id: updated.assignedToId,
            },
        },
    });
});

export default router;
