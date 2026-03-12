import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import ProtectedRoute from './router/ProtectedRoute';
import PublicOnlyRoute from './router/PublicOnlyRoute';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import MainFeedPage from './pages/MainFeedPage';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainFeedPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
