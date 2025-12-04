import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CookiesProvider } from 'react-cookie'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import 'react-medium-image-zoom/dist/styles.css';

let query = new QueryClient()


ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <CookiesProvider>
      <ThemeProvider>
        <LanguageProvider>
          <QueryClientProvider client={query}>
            <App />
            <ToastContainer position='bottom-right' stacked autoClose={2000} />
            <ReactQueryDevtools position='bottom-right' />
          </QueryClientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </CookiesProvider>
  </>
)
