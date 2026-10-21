import { createBrowserRouter } from 'react-router-dom';
// @ts-ignore - AppShell.jsx will be migrated to TypeScript in a later phase
import { AppShell } from '../components/layout/AppShell';
// @ts-ignore - RequireAuth.jsx will be migrated to TypeScript in a later phase
import { RequireAuth } from '../components/auth/RequireAuth';
// @ts-ignore - DashboardPage.jsx will be migrated to TypeScript in a later phase
import { DashboardPage } from '../pages/DashboardPage';
// @ts-ignore - HomePage.jsx will be migrated to TypeScript in a later phase
import { HomePage } from '../pages/HomePage';
// @ts-ignore - LoginPage.jsx will be migrated to TypeScript in a later phase
import { LoginPage } from '../pages/LoginPage';
// @ts-ignore - NotFoundPage.jsx will be migrated to TypeScript in a later phase
import { NotFoundPage } from '../pages/NotFoundPage';
// @ts-ignore - SignInPage.jsx will be migrated to TypeScript in a later phase
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