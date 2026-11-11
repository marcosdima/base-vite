import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { HomePage } from '../pages/HomePage';
import { InodesPage } from '../pages/InodesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProcessesPage } from '../pages/ProcessesPage';
import { TerminalPage } from '../pages/TerminalPage';

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
        path: 'inodes',
        element: <InodesPage />,
      },
      {
        path: 'processes',
        element: <ProcessesPage />,
      },
      {
        path: 'terminal',
        element: <TerminalPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
