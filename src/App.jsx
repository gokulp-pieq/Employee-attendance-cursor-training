import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import EmployeeManagement from './components/EmployeeManagement';
import AttendanceSummary from './components/AttendanceSummary';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role_id !== 5 && user.roleId !== 5 && user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('AppRoutes - User:', user);
  console.log('AppRoutes - User role_id:', user?.role_id);
  console.log('AppRoutes - User roleId:', user?.roleId);
  console.log('AppRoutes - User role:', user?.role);
  console.log('AppRoutes - Is admin by role_id?', user?.role_id === 5);
  console.log('AppRoutes - Is admin by roleId?', user?.roleId === 5);
  console.log('AppRoutes - Is admin by role?', user?.role === 'Admin');
  console.log('AppRoutes - Final admin check:', (user?.role_id === 5 || user?.roleId === 5 || user?.role === 'Admin'));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {(user?.role_id === 5 || user?.roleId === 5 || user?.role === 'Admin') ? <AdminDashboard /> : <Dashboard />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employees" 
        element={
          <ProtectedRoute adminOnly={true}>
            <EmployeeManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/attendance-summary" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AttendanceSummary />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
