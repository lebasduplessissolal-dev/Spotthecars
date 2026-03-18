import { Toaster } from "sonner";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

import AppLayout from './components/layout/AppLayout';
import MapPage from './pages/MapPage';
import AddSpot from './pages/AjouterSpot';
import Feed from './pages/Feed';
import Profile from './pages/Profil';
import Login from './pages/Login';

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="text-xs text-zinc-600 tracking-widest uppercase">SpotCar</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Map" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/Map" element={<MapPage />} />
        <Route path="/AddSpot" element={<AddSpot />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/Map" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
