import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'toolmanager_users';
const SESSION_KEY = 'toolmanager_session';

function loadUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
    const defaultUsers = [
      { id: 'USR000001', name: 'Quản lý DEZ LAB', email: 'dez@gmail.com', password: '123456', role: 'Quản lý', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email, password) => {
    return new Promise((resolve, reject) => {
      const users = loadUsers();
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) {
        reject(new Error('Email hoặc mật khẩu không đúng'));
        return;
      }
      const session = { id: found.id, name: found.name, email: found.email, role: found.role };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      resolve(session);
    });
  }, []);

  const register = useCallback((name, email, password) => {
    return new Promise((resolve, reject) => {
      const users = loadUsers();
      if (users.some(u => u.email === email)) {
        reject(new Error('Email đã được đăng ký'));
        return;
      }
      const newUser = {
        id: 'USR' + String(Date.now()).slice(-6),
        name,
        email,
        password,
        role: 'Nhân viên',
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, newUser]);
      const session = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      resolve(session);
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
