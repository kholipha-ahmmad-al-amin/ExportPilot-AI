import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { roleHome } from './lib/access';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SeoManager } from './components/SeoManager';
import { MobileTabBar } from './components/MobileTabBar';
import { SessionNotice } from './components/SessionNotice';
import { PageErrorBoundary } from './components/PageErrorBoundary';
import { ToastProvider } from './components/ui/toast';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';

// Keep the landing page in the initial bundle and load other pages on demand.
import { Landing } from './pages/Landing';
// Overlays are fixed-position widgets — defer them until after first paint.
const GlobalAiChatbot = React.lazy(() => import('./components/GlobalAiChatbot').then((page) => ({ default: page.GlobalAiChatbot })));
const CommandPalette = React.lazy(() => import('./components/CommandPalette').then((page) => ({ default: page.CommandPalette })));
const VoiceGuidePlayer = React.lazy(() => import('./components/VoiceGuidePlayer').then((page) => ({ default: page.VoiceGuidePlayer })));
const Login = React.lazy(() => import('./pages/Login').then((page) => ({ default: page.Login })));
const Register = React.lazy(() => import('./pages/Register').then((page) => ({ default: page.Register })));
const DocsViewer = React.lazy(() => import('./pages/DocsViewer').then((page) => ({ default: page.DocsViewer })));
const AboutUs = React.lazy(() => import('./pages/AboutUs').then((page) => ({ default: page.AboutUs })));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy').then((page) => ({ default: page.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService').then((page) => ({ default: page.TermsOfService })));
const NotFound = React.lazy(() => import('./pages/NotFound').then((page) => ({ default: page.NotFound })));
const AppWorkspace = React.lazy(() => import('./pages/AppWorkspace').then((page) => ({ default: page.AppWorkspace })));
const BuyerCatalog = React.lazy(() => import('./pages/BuyerCatalog').then((page) => ({ default: page.BuyerCatalog })));
const DataExplorer = React.lazy(() => import('./pages/DataExplorer').then((page) => ({ default: page.DataExplorer })));
const SecurityLab = React.lazy(() => import('./pages/SecurityLab').then((page) => ({ default: page.SecurityLab })));
const ArchitectureViewer = React.lazy(() => import('./pages/ArchitectureViewer').then((page) => ({ default: page.ArchitectureViewer })));
const PresentationMode = React.lazy(() => import('./pages/PresentationMode').then((page) => ({ default: page.PresentationMode })));
const PitchDeck = React.lazy(() => import('./pages/PitchDeck').then((page) => ({ default: page.PitchDeck })));
const AuditReport = React.lazy(() => import('./pages/AuditReport').then((page) => ({ default: page.AuditReport })));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel').then((page) => ({ default: page.AdminPanel })));
const ProgrammaticLandingPage = React.lazy(() => import('./pages/ProgrammaticLandingPage'));
const TradeIntelligenceHub = React.lazy(() => import('./pages/TradeIntelligenceHub').then((page) => ({ default: page.TradeIntelligenceHub })));

const RouteAlias: React.FC<{ to?: string }> = ({ to }) => {
  const { user, isLoading } = useAuth();
  const { search, hash } = useLocation();
  if (!to && isLoading) return <div className="min-h-72" aria-busy="true" />;
  const target = to || (user ? roleHome(user.role) : '/app');
  return <Navigate to={`${target}${search}${hash}`} replace />;
};

const HashAnchorScroll: React.FC = () => {
  const { pathname, hash, key } = useLocation();

  React.useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const scrollToAnchor = () => {
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempts++ < 30) retryTimer = setTimeout(scrollToAnchor, 50);
    };

    const frame = requestAnimationFrame(scrollToAnchor);
    return () => {
      cancelAnimationFrame(frame);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [pathname, hash, key]);

  return null;
};

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6" role="status" aria-busy="true" aria-label="Loading page">
    <div className="relative">
      <div className="h-14 w-14 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/10 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-7 w-7 rounded-lg border-[3px] border-emerald-600 border-t-transparent animate-spin" />
      </div>
    </div>
    <div className="flex gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
    <span className="sr-only">Loading…</span>
  </div>
);

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  const withPageLoader = (element: React.ReactNode) => (
    <React.Suspense fallback={<PageLoader />}>
      {element}
    </React.Suspense>
  );
  const programmaticPage = (kind: 'location' | 'sector' | 'feature' | 'product') => (
    withPageLoader(<ProgrammaticLandingPage kind={kind} />)
  );

  return (
    <MotionConfig reducedMotion="user">
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <HashAnchorScroll />
        <SeoManager />
        <div style={{ backgroundColor: 'var(--color-paper)' }} className="flex flex-col min-h-screen text-slate-800 dark:text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 transition-colors duration-200">
          <div className="w-full max-w-[1920px] mx-auto 2xl:shell-rails flex flex-col min-h-screen">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
          >
            Skip to content
          </a>
          <Navbar />
          <SessionNotice />
          <main id="main-content" className="flex-1">
            <PageErrorBoundary>
            <PageTransition>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={withPageLoader(<AboutUs />)} />
              <Route path="/privacy" element={withPageLoader(<PrivacyPolicy />)} />
              <Route path="/terms" element={withPageLoader(<TermsOfService />)} />
              <Route path="/docs" element={withPageLoader(<DocsViewer />)} />
              <Route path="/login" element={withPageLoader(<Login />)} />
              <Route path="/register" element={withPageLoader(<Register />)} />
              <Route path="/presentation" element={withPageLoader(<PresentationMode />)} />
              <Route path="/pitchdeck" element={withPageLoader(<PitchDeck />)} />
              <Route path="/intelligence" element={withPageLoader(<ProtectedRoute requiredRole="factory_owner"><TradeIntelligenceHub /></ProtectedRoute>)} />
              <Route path="/not-found" element={withPageLoader(<NotFound />)} />
              <Route path="/locations/:slug" element={programmaticPage('location')} />
              <Route path="/sectors/:slug" element={programmaticPage('sector')} />
              <Route path="/features/:slug" element={programmaticPage('feature')} />
              <Route path="/products/:slug" element={programmaticPage('product')} />

              {/* Protected Exporter & Importer Workspaces */}
              <Route
                path="/app"
                element={withPageLoader(<ProtectedRoute requiredRole={['factory_owner']}><AppWorkspace /></ProtectedRoute>)}
              />
              <Route
                path="/dealroom"
                element={withPageLoader(<ProtectedRoute requiredRole={['factory_owner']}><AppWorkspace defaultMode="dealroom" /></ProtectedRoute>)}
              />
              <Route
                path="/buyers"
                element={withPageLoader(<ProtectedRoute requiredRole={['factory_owner', 'verified_buyer']}><BuyerCatalog /></ProtectedRoute>)}
              />
              <Route
                path="/data"
                element={withPageLoader(<ProtectedRoute requiredRole={['factory_owner', 'compliance_auditor']}><DataExplorer /></ProtectedRoute>)}
              />
              <Route
                path="/security"
                element={withPageLoader(<ProtectedRoute requiredRole={['factory_owner', 'compliance_auditor']}><SecurityLab /></ProtectedRoute>)}
              />
              <Route
                path="/architecture"
                element={withPageLoader(<ProtectedRoute><ArchitectureViewer /></ProtectedRoute>)}
              />

              {/* Protected Admin & Governance Routes */}
              <Route
                path="/admin"
                element={withPageLoader(<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>)}
              />
              <Route
                path="/audit"
                element={withPageLoader(<ProtectedRoute><AuditReport /></ProtectedRoute>)}
              />

              {/* Route Aliases & Deep-Link Fallbacks */}
              <Route path="/catalog" element={<RouteAlias to="/buyers" />} />
              <Route path="/dashboard" element={<RouteAlias />} />
              <Route path="/hs-search" element={<Navigate to="/features/hs-classification" replace />} />
              <Route path="/carbon-audit" element={<Navigate to="/features/cbam-audit" replace />} />

              {/* 404 Catch-All Page */}
              <Route path="*" element={withPageLoader(<NotFound />)} />
            </Routes>
            </PageTransition>
            </PageErrorBoundary>
          </main>
          <Footer />
          <React.Suspense fallback={null}>
            <GlobalAiChatbot />
            <CommandPalette />
            <VoiceGuidePlayer />
          </React.Suspense>
          <MobileTabBar />
          <div className="h-14 md:hidden" aria-hidden="true" />
          </div>
        </div>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
    </MotionConfig>
  );
};

export default App;
