import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, useUser, SignIn } from '@clerk/clerk-react';
import { apiFetch, api } from './api';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import AppLayout from './components/AppLayout';

// Pages
import Onboarding from './pages/Onboarding';
import DeveloperDashboard from './pages/DeveloperDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import CreateRequest from './pages/CreateRequest';
import { MyRequests } from './pages/MyRequests';
import { MyClaims } from './pages/MyRequests';
import BrowseRequests from './pages/BrowseRequests';
import RequestDetail from './pages/RequestDetail';
import EditRequest from './pages/EditRequest';
import ProfileSettings from './pages/ProfileSettings';

// ── Auth gate: handles Clerk loading + sign-in + token sync ──
function AuthGate({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;
    const refresh = async () => {
      const t = await getToken();
      apiFetch.setToken(t);
      if (user) {
        await api.syncProfile({
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName || user.username || 'Anonymous',
          avatar_url: user.imageUrl,
        }).catch(() => {});
      }
    };
    refresh();
    const id = setInterval(refresh, 50_000);
    return () => clearInterval(id);
  }, [isSignedIn, user, getToken]);

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen text-ink-400 text-sm">
      Loading…
    </div>
  );

  if (!isSignedIn) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <div className="text-center mb-2">
        <h1 className="font-display text-2xl font-bold text-ink-50">Mentorship Marketplace</h1>
        <p className="text-ink-400 text-sm mt-1">Cross-team code review &amp; mentorship requests</p>
      </div>
      <SignIn routing="hash" />
    </div>
  );

  return children;
}

// ── Onboarding gate: redirects to /onboarding if profile incomplete ──
function OnboardingGate({ children }) {
  const { profile, loading, isOnboarded } = useProfile();

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-ink-400 text-sm">
      Loading profile…
    </div>
  );

  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

// ── Root redirect: sends user to their role-based dashboard ──
function RoleRedirect() {
  const { profile } = useProfile();
  const role = profile?.role || 'engineer';
  return <Navigate to={`/${role}/dashboard`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <ProfileProvider>
          <Routes>
            {/* Onboarding (no sidebar) */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Root redirect */}
            <Route path="/" element={
              <OnboardingGate><RoleRedirect /></OnboardingGate>
            } />

            {/* Developer routes */}
            <Route element={<OnboardingGate><AppLayout /></OnboardingGate>}>
              <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
              <Route path="/developer/requests/new" element={<CreateRequest />} />
              <Route path="/developer/requests" element={<MyRequests />} />
              <Route path="/developer/requests/:id" element={<RequestDetail />} />
              <Route path="/developer/requests/:id/edit" element={<EditRequest />} />
              <Route path="/developer/profile" element={<ProfileSettings />} />
            </Route>

            {/* Engineer routes */}
            <Route element={<OnboardingGate><AppLayout /></OnboardingGate>}>
              <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
              <Route path="/engineer/browse" element={<BrowseRequests />} />
              <Route path="/engineer/claimed" element={<MyClaims />} />
              <Route path="/engineer/requests/:id" element={<RequestDetail />} />
              <Route path="/engineer/requests/:id/edit" element={<EditRequest />} />
              <Route path="/engineer/profile" element={<ProfileSettings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ProfileProvider>
      </AuthGate>
    </BrowserRouter>
  );
}
