import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { store } from '@/app/store';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import '@/i18n';
import { AppThemeProvider } from '@/styles/AppThemeProvider';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </ErrorBoundary>
    </AppThemeProvider>
  </React.StrictMode>,
);
