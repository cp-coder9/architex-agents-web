export interface StoredUser {
    token: string;
    email: string;
    name?: string | null;
    role: string;
}

const storageKey = 'architex-auth';

export function saveAuth(auth: StoredUser) {
    localStorage.setItem(storageKey, JSON.stringify(auth));
}

export function loadAuth(): StoredUser | null {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as StoredUser;
    } catch {
        return null;
    }
}

export function clearAuth() {
    localStorage.removeItem(storageKey);
}
