import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import ManagerLayout from '../layouts/ManagerLayout';
import CaretakerLayout from '../layouts/CaretakerLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import PatientLayout from '../layouts/PatientLayout';

// Public Pages
import Landing from '../pages/Landing';
import RoleSelection from '../pages/RoleSelection'; // Kept for now, but flow will change
import Login from '../pages/Login';
import CaretakerApply from '../pages/public/CaretakerApply';
import MentorRequest from '../pages/public/MentorRequest';

// Admin Pages
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';
import OrgAdminDashboard from '../pages/admin/OrgAdminDashboard';
import OrganizationBilling from '../pages/admin/OrganizationBilling';
import ComplianceLogs from '../pages/admin/ComplianceLogs';

// Manager Pages
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import CaretakerApplications from '../pages/manager/CaretakerApplications';
import PatientEnrollment from '../pages/manager/PatientEnrollment';
import MentorRequests from '../pages/manager/MentorRequests';
import Patients from '../pages/manager/Patients';
import Analytics from '../pages/manager/Analytics';
import Settings from '../pages/manager/Settings';
import Caretakers from '../pages/manager/Caretakers';
import Alerts from '../pages/manager/Alerts';

// Caretaker Pages
import CaretakerHome from '../pages/caretaker/Home';
import CaretakerPatients from '../pages/caretaker/Patients';
import CaretakerHistory from '../pages/caretaker/History';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import Medications from '../pages/customer/Medications';
import Journal from '../pages/customer/Journal';
import Messages from '../pages/customer/Messages';

// Patient Pages
import PatientDashboard from '../pages/patient/Dashboard';
import PatientCalls from '../pages/patient/Calls';
import PatientMedications from '../pages/patient/Medications';
import PatientProfile from '../pages/patient/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, selectedRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/role-selection" replace />;
  }

  if (requiredRole && selectedRole !== requiredRole) {
    // Redirect to appropriate dashboard if logged in but wrong role
    switch (selectedRole) {
      case 'super_admin': return <Navigate to="/super-admin/dashboard" replace />;
      case 'org_admin': return <Navigate to="/org-admin/dashboard" replace />;
      case 'manager': return <Navigate to="/manager/dashboard" replace />;
      case 'caretaker': return <Navigate to="/caretaker/home" replace />;
      case 'mentor': return <Navigate to="/customer/dashboard" replace />;
      case 'patient': return <Navigate to="/patient/dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/careers" element={<CaretakerApply />} />
      <Route path="/request-access" element={<MentorRequest />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin/*"
        element={
          <ProtectedRoute requiredRole="super_admin">
            <Routes>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Org Admin Routes */}
      <Route
        path="/org-admin/*"
        element={
          <ProtectedRoute requiredRole="org_admin">
            <Routes>
              <Route path="dashboard" element={<OrgAdminDashboard />} />
              <Route path="billing" element={<OrganizationBilling />} />
              <Route path="compliance" element={<ComplianceLogs />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Protected Manager Routes */}
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute requiredRole="manager">
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="applications" element={<CaretakerApplications />} />
        <Route path="enroll-patient" element={<PatientEnrollment />} />
        <Route path="mentor-requests" element={<MentorRequests />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<div>Patient Detail Page</div>} />
        <Route path="caretakers" element={<Caretakers />} />
        <Route path="caretakers/:id" element={<div>Caretaker Detail Page</div>} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="communications" element={<div>Communications Page</div>} />
        <Route path="settings" element={<Settings />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Protected Caretaker Routes */}
      <Route
        path="/caretaker/*"
        element={
          <ProtectedRoute requiredRole="caretaker">
            <CaretakerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<CaretakerHome />} />
        <Route path="patients" element={<CaretakerPatients />} />
        <Route path="patients/:id" element={<div>Patient Quick View Page</div>} />
        <Route path="call/:patientId" element={<div>Active Call Interface</div>} />
        <Route path="history" element={<CaretakerHistory />} />
        <Route path="profile" element={<div>Profile Page</div>} />
        <Route path="" element={<Navigate to="home" replace />} />
      </Route>

      {/* Protected Customer Routes */}
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute requiredRole="mentor">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="medications" element={<Medications />} />
        <Route path="medications/add" element={<div>Add Medication Page</div>} />
        <Route path="messages" element={<Messages />} />
        <Route path="journal" element={<Journal />} />
        <Route path="journal/entry" element={<div>New Journal Entry Page</div>} />
        <Route path="more" element={<div>More/Settings Page</div>} />
        <Route path="emergency" element={<div>Emergency Card Page</div>} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Protected Patient Routes */}
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="calls" element={<PatientCalls />} />
        <Route path="medications" element={<PatientMedications />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
