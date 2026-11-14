import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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
  liteMode: boolean;
  toggleLiteMode: () => void;
  t: (bn: string, en: string) => string;
  login: (email: string, pass: string) => Promise<{ user: User | null; networkError: boolean; status?: number }>;
  logout: () => Promise<boolean>;
  sessionNotice: 'unavailable' | 'expired' | 'logout_failed' | null;
  refreshSession: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const userRef = useRef<User | null>(null);
  const sessionRevision = useRef(0);
  const checkRevision = useRef(0);
  const [sessionNotice, setSessionNotice] = useState<AuthContextType['sessionNotice']>(null);
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
  const [liteMode, setLiteModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('exportpilot_lite_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleLiteMode = () => {
    setLiteModeState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('exportpilot_lite_mode', String(next));
      } catch {}
      return next;
    });
  };

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

  // Keep the document language in sync from the first paint, not only on
  // manual toggles, so assistive tech announces the right locale on load.
  useEffect(() => {
    document.documentElement.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
  }, [lang]);

  const refreshSession = useCallback(async () => {
      const revision = sessionRevision.current;
      const check = ++checkRevision.current;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch('/api/v1/auth/me', { cache: 'no-store', signal: controller.signal });
        if (revision !== sessionRevision.current || check !== checkRevision.current) return;
        if (res.ok) {
          const data = await res.json();
          if (revision !== sessionRevision.current || check !== checkRevision.current) return;
          userRef.current = data;
          setUser(data);
          setSessionNotice(null);
        } else if (res.status === 401 || res.status === 403) {
          if (userRef.current) setSessionNotice('expired');
          userRef.current = null;
          setUser(null);
        } else {
          setSessionNotice('unavailable');
        }
      } catch {
        if (revision === sessionRevision.current && check === checkRevision.current) setSessionNotice('unavailable');
      } finally {
        clearTimeout(timer);
        if (revision === sessionRevision.current && check === checkRevision.current) setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    void refreshSession();
    const onVisible = () => { if (document.visibilityState === 'visible') void refreshSession(); };
    const onStorage = (event: StorageEvent) => { if (event.key === 'exportpilot_session_changed') void refreshSession(); };
    window.addEventListener('online', refreshSession);
    window.addEventListener('focus', onVisible);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(() => { if (userRef.current && document.visibilityState === 'visible') void refreshSession(); }, 60000);
    return () => {
      ++checkRevision.current;
      clearInterval(timer);
      window.removeEventListener('online', refreshSession);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshSession]);

  const notifyOtherTabs = () => {
    try { localStorage.setItem('exportpilot_session_changed', `${Date.now()}-${Math.random()}`); } catch {}
  };

  const login: AuthContextType['login'] = async (email, pass) => {
    ++sessionRevision.current;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }), signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        userRef.current = data.user;
        setUser(data.user);
        setSessionNotice(null);
        notifyOtherTabs();
        return { user: data.user as User, networkError: false };
      }
      return { user: null, networkError: false, status: res.status };
    } catch {
      // The request never reached the server: report a connectivity problem
      // instead of implying the credentials were wrong.
      return { user: null, networkError: true };
    } finally {
      clearTimeout(timer);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    ++sessionRevision.current;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch('/api/v1/auth/logout', { method: 'POST', signal: controller.signal });
      if (!res.ok) throw new Error('Logout failed');
      userRef.current = null;
      setUser(null);
      setSessionNotice(null);
      notifyOtherTabs();
      return true;
    } catch {
      setSessionNotice('logout_failed');
      return false;
    } finally {
      clearTimeout(timer);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, lang, setLang, theme, setTheme, toggleTheme, liteMode, toggleLiteMode, t, login, logout, isLoading, sessionNotice, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
