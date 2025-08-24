
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import VolunteerPage from './pages/VolunteerPage';
import LoginPage from './pages/LoginPage';
import ProjectManagerDashboard from './pages/ProjectManagerDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import BlogPostPage from './pages/BlogPostPage';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ActivitiesThematicPage from './pages/ActivitiesThematicPage';
import ViewResourcesPage from './pages/ViewResourcesPage';
import BlogPage from './pages/BlogPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';

const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-[#4b0082]">{title} - Page under construction</h1>
    </div>
);


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {/* <Route path="/project-manager" element={<ProjectManagerDashboard />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} /> */}
        {/* Protected Admin Routes */}
        <Route path="/superadmin" element={
          <ProtectedRoute requiredRole="admin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }>
          {/* Nested admin routes */}
        </Route>

        {/* Protected Manager Routes */}
        <Route path="/project-manager" element={
          <ProtectedRoute requiredRole="manager">
            <ProjectManagerDashboard />
          </ProtectedRoute>
        }>
          {/* Nested manager routes */}
        </Route>
        <Route path="/blog" element={<BlogPostPage />} />
        <Route path="/blogs" element={<BlogPage />}/>
        {/* Placeholder routes from nav */}
        <Route path="/activities" element={<ActivitiesThematicPage />} />
        <Route path="/resources" element={<PlaceholderPage title="Resources" />} />
        <Route path="/resources/view" element={<ViewResourcesPage />} />
        <Route path="/payment-verification" element={<PaymentSuccessPage />} />
        <Route path="/payment/failed" element={<PaymentFailedPage />} />
        <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
        {/* <Route path="/blog" element={<PlaceholderPage title="Blog" />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
