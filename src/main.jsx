import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PrivyProvider } from '@privy-io/react-auth'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { privyService } from './services/privy'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivyProvider
      appId={privyService.config.appId}
      config={{
        appearance: privyService.config.appearance,
        embeddedWallets: privyService.config.embeddedWallets,
        loginMethods: privyService.config.loginMethods,
        supportedChains: privyService.config.supportedChains
      }}
    >
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(0, 0%, 100%)',
              color: 'hsl(220, 15%, 15%)',
              border: '1px solid hsl(220, 15%, 20%)',
              borderRadius: '12px'
            }
          }}
        />
      </BrowserRouter>
    </PrivyProvider>
  </React.StrictMode>,
)
