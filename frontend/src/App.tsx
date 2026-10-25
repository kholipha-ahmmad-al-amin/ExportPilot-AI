import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SeoManager } from './components/SeoManager';
import { GlobalAiChatbot } from './components/GlobalAiChatbot';
import { CommandPalette } from './components/CommandPalette';
import { MobileTabBar } from './components/MobileTabBar';
import { VoiceGuidePlayer } from './components/VoiceGuidePlayer';
import { MotionConfig } from 'framer-motion';

// Keep the landing page in the initial bundle and load other pages on demand.
import { Landing } from './pages/Landing';
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

const HashAnchorScroll: React.FC = () => {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const scrollToAnchor = () => {
      const id = decodeURIComponent(hash.slice(1));
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
  }, [pathname, hash]);

  return null;
};

export const App: React.FC = () => {
  const withPageLoader = (element: React.ReactNode) => (
    <React.Suspense fallback={<div className="min-h-72" aria-busy="true" aria-label="Loading page" />}>
      {element}
    </React.Suspense>
  );
  const programmaticPage = (kind: 'location' | 'sector' | 'feature' | 'product') => (
    withPageLoader(<ProgrammaticLandingPage kind={kind} />)
  );

  return (
    <MotionConfig reducedMotion="user">
    <AuthProvider>
      <BrowserRouter>
        <HashAnchorScroll />
        <SeoManager />
        <div className="flex flex-col min-h-screen bg-ambient-trade text-slate-800 dark:text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 transition-colors duration-200">
          <div className="w-full max-w-[1920px] mx-auto 2xl:shell-rails flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
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
              <Route path="/catalog" element={<Navigate to="/buyers" replace />} />
              <Route path="/dashboard" element={<Navigate to="/app" replace />} />

              {/* 404 Catch-All Page */}
              <Route path="*" element={withPageLoader(<NotFound />)} />
            </Routes>
          </main>
          <Footer />
          <GlobalAiChatbot />
          <CommandPalette />
          <MobileTabBar />
          <VoiceGuidePlayer />
          <div className="h-14 md:hidden" aria-hidden="true" />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
    </MotionConfig>
  );
};

export default App;
