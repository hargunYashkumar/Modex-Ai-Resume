import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import ErrorBoundary from './components/ui/ErrorBoundary'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1C2540',
            color: '#F5F4F0',
            border: '1px solid #2A3555',
            borderRadius: '4px',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '13px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#C9A84C', secondary: '#1C2540' } },
          error:   { iconTheme: { primary: '#8C2A2A', secondary: '#F5F4F0' } },
        }}
      />
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
