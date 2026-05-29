import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AccessibilityProvider } from './accessibility/AccessibilityContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </StrictMode>,
)
