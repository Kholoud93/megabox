import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CookiesProvider } from 'react-cookie'
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
      <QueryClientProvider client={query}>
        <GoogleOAuthProvider clientId='902607791526-lb6qtfclisk5puajdrbfve5ge45lfon9.apps.googleusercontent.com'>

          <App />
          <ToastContainer position='bottom-right' stacked />
        </GoogleOAuthProvider>

        <ReactQueryDevtools position='bottom-right' />

      </QueryClientProvider>
    </CookiesProvider>
  </>
)
