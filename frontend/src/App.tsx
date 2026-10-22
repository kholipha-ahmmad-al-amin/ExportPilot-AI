import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DocsViewer } from './pages/DocsViewer';

// Protected Sovereign Workspaces
import { AppWorkspace } from './pages/AppWorkspace';
import { BuyerCatalog } from './pages/BuyerCatalog';
import { DataExplorer } from './pages/DataExplorer';
import { SecurityLab } from './pages/SecurityLab';
import { ArchitectureViewer } from './pages/ArchitectureViewer';
import { PresentationMode } from './pages/PresentationMode';
import { PitchDeck } from './pages/PitchDeck';
import { AuditReport } from './pages/AuditReport';
import { AdminPanel } from './pages/AdminPanel';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/docs" element={<DocsViewer />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/presentation" element={<PresentationMode />} />
              <Route path="/pitchdeck" element={<PitchDeck />} />

              {/* Protected Exporter & Importer Workspaces */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppWorkspace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyers"
                element={
                  <ProtectedRoute>
                    <BuyerCatalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data"
                element={
                  <ProtectedRoute>
                    <DataExplorer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/security"
                element={
                  <ProtectedRoute>
                    <SecurityLab />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/architecture"
                element={
                  <ProtectedRoute>
                    <ArchitectureViewer />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin & Governance Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit"
                element={
                  <ProtectedRoute>
                    <AuditReport />
                  </ProtectedRoute>
                }
              />

              {/* Route Aliases & Deep-Link Fallbacks */}
              <Route path="/catalog" element={<Navigate to="/buyers" replace />} />
              <Route path="/dealroom" element={<Navigate to="/app" replace />} />
              <Route path="/dashboard" element={<Navigate to="/app" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
