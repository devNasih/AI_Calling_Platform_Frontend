import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/layout/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Import pages (we'll create these next)
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Contacts from "../pages/Contacts";
import CampaignsEnhanced from "../pages/CampaignsEnhanced";
import CallHistory from "../pages/CallHistory";
import InboundCalls from "../pages/InboundCalls";
import AIInsights from "../pages/AIInsights";
import KnowledgeBase from "../pages/KnowledgeBase";
import Analytics from "../pages/Analytics";
import Settings from "../pages/Settings";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while determining auth status
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="campaigns" element={<CampaignsEnhanced />} />
        <Route path="history" element={<CallHistory />} />
        <Route path="inbound" element={<InboundCalls />} />
        <Route path="/ai">
          <Route index element={<AIInsights />} />
          <Route path=":callId" element={<AIInsights />} />{" "}
        </Route>
        <Route path="knowledge" element={<KnowledgeBase />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all route - redirect based on auth status */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
