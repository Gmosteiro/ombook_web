export const TOKEN_KEY = 'auth_token';


const safeGet = (key: string): string | null => {
    try { return localStorage.getItem(key); } catch {
        console.log('safeGet - Error accessing localStorage', key);
        return null;
    }
};
const safeSet = (key: string, value: string): void => {
    try { localStorage.setItem(key, value); } catch {
        console.log('safeSet - Error accessing localStorage', key);
    }
};
const safeRemove = (key: string): void => {
    try { localStorage.removeItem(key); } catch {
        console.log('safeRemove - Error accessing localStorage', key);
    }
};

const TokenManager = {
    getToken: (): string | null => safeGet(TOKEN_KEY),
    setToken: (token: string) => safeSet(TOKEN_KEY, token),
    clearToken: () => safeRemove(TOKEN_KEY),

    // helper para escuchar cambios en otras pestañas
    onStorageChange: (cb: (token: string | null) => void) => {
        const handler = (e: StorageEvent) => {
            if (e.key === TOKEN_KEY) cb(e.newValue);
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }
};

export default TokenManager;