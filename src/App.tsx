import React, { Suspense, lazy } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { SyncProvider } from "./contexts/SyncContext";
import { PermissionGate } from "./components/PermissionGate";
import { VIEWS } from "./constants/permissions";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Lazy-loaded routes
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ExecDashboard = lazy(() => import("./pages/ExecDashboard"));
const ExecTeamPerf = lazy(() => import("./pages/ExecTeamPerf"));
const DataEntry = lazy(() => import("./pages/DataEntry"));
const CityPivot = lazy(() => import("./pages/CityPivot"));
const TeamPivot = lazy(() => import("./pages/TeamPivot"));
const DataExplorer = lazy(() => import("./pages/DataExplorer"));
const Assignment = lazy(() => import("./pages/Assignment"));
const BandExplorer = lazy(() => import("./pages/BandExplorer"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const ConnectivityHub = lazy(() => import("./pages/ConnectivityHub"));
const LiveMonitoring = lazy(() => import("./pages/LiveMonitoring"));
const AllFeedback = lazy(() => import("./pages/AllFeedback"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Profile = lazy(() => import("./pages/Profile"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium tracking-wide">Loading application module...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, view }: { children: React.ReactNode; view?: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (view) return <PermissionGate view={view} fallback={<Navigate to={user?.role === "EXECUTIVE" ? "/exec-dashboard" : "/dashboard"} replace />}>{children}</PermissionGate>;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === "EXECUTIVE" ? "/exec-dashboard" : "/dashboard"} replace /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute view={VIEWS.DASHBOARD}><Dashboard /></ProtectedRoute>} />
        <Route path="/exec-dashboard" element={<ProtectedRoute view={VIEWS.EXEC_DASHBOARD}><ExecDashboard /></ProtectedRoute>} />
        <Route path="/exec-team-perf" element={<ProtectedRoute view={VIEWS.EXEC_TEAM_PERF}><ExecTeamPerf /></ProtectedRoute>} />
        <Route path="/data-entry" element={<ProtectedRoute view={VIEWS.DATA_ENTRY}><DataEntry /></ProtectedRoute>} />
        <Route path="/explorer" element={<ProtectedRoute view={VIEWS.DATA_EXPLORER}><DataExplorer /></ProtectedRoute>} />
        <Route path="/city-pivot" element={<ProtectedRoute view={VIEWS.CITY_PIVOT}><CityPivot /></ProtectedRoute>} />
        <Route path="/team-pivot" element={<ProtectedRoute view={VIEWS.TEAM_PIVOT}><TeamPivot /></ProtectedRoute>} />
        <Route path="/band-explorer" element={<ProtectedRoute view={VIEWS.CITY_TEAM_MATRIX}><BandExplorer /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute view={VIEWS.SETTINGS}><SettingsPage /></ProtectedRoute>} />
        <Route path="/connectivity" element={<ProtectedRoute view={VIEWS.CONNECTIVITY_HUB}><ConnectivityHub /></ProtectedRoute>} />
        <Route path="/live-monitoring" element={<ProtectedRoute view={VIEWS.LIVE_MONITORING}><LiveMonitoring /></ProtectedRoute>} />
        <Route path="/feedbacks" element={<ProtectedRoute view={VIEWS.FEEDBACKS}><AllFeedback /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute view={VIEWS.ATTENDANCE}><Attendance /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/assignment" element={<ProtectedRoute view={VIEWS.ASSIGNMENT}><Assignment /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute view={VIEWS.AUDIT_LOG}><AuditLog /></ProtectedRoute>} />
        <Route path="/customer/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={user ? (user.role === "EXECUTIVE" ? "/exec-dashboard" : "/dashboard") : "/login"} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
  <AuthProvider>
    <DataProvider>
      <SyncProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </SyncProvider>
    </DataProvider>
  </AuthProvider>
  </ThemeProvider>
);

export default App;
