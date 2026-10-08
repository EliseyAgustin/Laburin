/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { OnboardingProvider } from './hooks/useOnboarding';
import { Login } from './pages/Login';
import { RecuperarPassword } from './pages/RecuperarPassword';
import { NuevaPassword } from './pages/NuevaPassword';
import { Onboarding } from './pages/Onboarding';
import { Tablero } from './pages/Tablero';
import { Offers } from './pages/Offers';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { REDIRECCIONES_LEGACY, RUTAS } from './lib/rutas';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/recuperar" element={<RecuperarPassword />} />
              <Route path="/nueva-contrasena" element={<NuevaPassword />} />

              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path={RUTAS.postulaciones} element={<Tablero />} />
                <Route path={RUTAS.ofertas} element={<Offers />} />
                <Route path={RUTAS.progreso} element={<Analytics />} />
                <Route path={RUTAS.perfil} element={<Settings />} />
              </Route>

              {/* URLs anteriores: siguen llevando a la pantalla correcta (enlaces guardados, marcadores). */}
              {Object.entries(REDIRECCIONES_LEGACY).map(([desde, hacia]) => (
                <Route key={desde} path={desde} element={<Navigate to={hacia} replace />} />
              ))}

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
