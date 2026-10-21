import { createBrowserRouter } from 'react-router-dom';
// @ts-ignore - AppShell.jsx will be migrated to TypeScript in a later phase
import { AppShell } from '../components/layout/AppShell';
// @ts-ignore - RequireAuth.jsx will be migrated to TypeScript in a later phase
import { RequireAuth } from '../components/auth/RequireAuth';
import { DashboardPage } from '../pages/DashboardPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SignInPage } from '../pages/SignInPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signin',
        element: <SignInPage />,
      },
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);