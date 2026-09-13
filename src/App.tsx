/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Offers } from './pages/Offers';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/tablero" element={<Dashboard />} />
            <Route path="/ofertas" element={<Offers />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/configuracion" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
