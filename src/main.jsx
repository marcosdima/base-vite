import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from './app/store'
import { router } from './app/router'
import './i18n'
import { AppThemeProvider } from './styles/AppThemeProvider'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <AppThemeProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </AppThemeProvider>
  </React.StrictMode>,
)