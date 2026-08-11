import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppExperienceProvider } from './experience/20260811_AppExperience.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppExperienceProvider>
      <App />
    </AppExperienceProvider>
  </StrictMode>,
)
