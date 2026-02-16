const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name?: string | null;
        role: string;
    };
}

export interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    createdAt: string;
}

export interface Project {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    documents: Document[];
    createdAt: string;
    client?: User;
}

export interface Document {
    id: string;
    filename: string;
    type: string;
    url: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    project?: Project | null;
    assignedTo?: User | null;
    createdAt: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed.' }));
        throw new Error(error.message || 'Request failed.');
    }
    return response.json() as Promise<T>;
}

export async function registerUser(payload: {
    email: string;
    password: string;
    name: string;
}) {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    return handleResponse<AuthResponse>(response);
}

export async function loginUser(payload: { email: string; password: string }) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    return handleResponse<AuthResponse>(response);
}

export async function fetchProjects(token: string) {
    const response = await fetch(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return handleResponse<{ projects: Project[] }>(response);
}

export async function createProject(token: string, payload: { title: string; description?: string }) {
    const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    return handleResponse<{ project: Project }>(response);
}

export async function uploadDocument(token: string, projectId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/projects/${projectId}/documents`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    return handleResponse<{ document: Document }>(response);
}

export async function fetchAdminProjects(token: string) {
    const response = await fetch(`${API_BASE}/admin/projects`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return handleResponse<{ projects: Project[] }>(response);
}

export async function updateProjectStatus(token: string, projectId: string, status: string) {
    const response = await fetch(`${API_BASE}/admin/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });

    return handleResponse<{ project: Project }>(response);
}

export async function fetchAdminUsers(token: string) {
    const response = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return handleResponse<{ users: User[] }>(response);
}

export async function createAdminUser(
    token: string,
    payload: { name?: string; email: string; password: string; role: string },
) {
    const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    return handleResponse<{ user: User }>(response);
}

export async function fetchAdminTasks(token: string) {
    const response = await fetch(`${API_BASE}/admin/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return handleResponse<{ tasks: Task[] }>(response);
}

export async function createAdminTask(
    token: string,
    payload: { title: string; description?: string; projectId?: string; assignedToId?: string },
) {
    const response = await fetch(`${API_BASE}/admin/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    return handleResponse<{ task: Task }>(response);
}

export async function fetchFreelancerTasks(token: string) {
    const response = await fetch(`${API_BASE}/freelancer/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return handleResponse<{ tasks: Task[] }>(response);
}

export async function updateTaskStatus(token: string, taskId: string, status: string) {
    const response = await fetch(`${API_BASE}/freelancer/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });

    return handleResponse<{ task: Task }>(response);
}
