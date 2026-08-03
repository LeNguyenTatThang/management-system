import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);
const SESSION_KEY = 'management_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [permissions, setPermissions] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.permissions || [];
    } catch {
      return [];
    }
  });

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      const msg = Array.isArray(json.message) ? json.message.join(', ') : json.message;
      throw new Error(msg || 'Đăng nhập thất bại');
    }

    const { accessToken, user: userData, permissions: perms } = json.data;
    const session = { ...userData, accessToken, permissions: perms };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    setPermissions(perms);
    return session;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setPermissions([]);
  }, []);

  const hasPermission = useCallback(
    (perm) => {
      if (!user) return false;
      if (user.roleCode === 'MANAGER') return true;
      return permissions.includes(perm);
    },
    [user, permissions],
  );

  return (
    <AuthContext.Provider value={{ user, permissions, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
