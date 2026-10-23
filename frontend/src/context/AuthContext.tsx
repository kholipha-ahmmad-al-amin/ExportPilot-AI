import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  full_name_bn: string;
  role: string;
  factory_name: string;
}

interface AuthContextType {
  user: User | null;
  lang: 'bn' | 'en';
  setLang: (l: 'bn' | 'en') => void;
  theme: 'light' | 'dark';
  setTheme: (th: 'light' | 'dark') => void;
  toggleTheme: () => void;
  t: (bn: string, en: string) => string;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLangState] = useState<'bn' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('exportpilot_lang');
      return saved === 'en' ? 'en' : 'bn';
    } catch {
      return 'bn';
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('exportpilot_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('exportpilot_theme', theme);
    } catch {}
  }, [theme]);

  const setTheme = (th: 'light' | 'dark') => {
    setThemeState(th);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLang = (l: 'bn' | 'en') => {
    setLangState(l);
    try {
      localStorage.setItem('exportpilot_lang', l);
    } catch {}
    document.documentElement.lang = l === 'bn' ? 'bn-BD' : 'en-US';
  };

  const t = useCallback((bn: string, en: string) => (lang === 'bn' ? bn : en), [lang]);

  useEffect(() => {
    const checkMe = async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkMe();
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user as User;
      }
      return null;
    } catch {
      return null;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, lang, setLang, theme, setTheme, toggleTheme, t, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
