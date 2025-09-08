import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { HealthProvider } from './context/HealthContext'
import Dashboard from './pages/Dashboard'
import SymptomTracker from './pages/SymptomTracker'
import ContentLibrary from './pages/ContentLibrary'
import TrendAlerts from './pages/TrendAlerts'
import Subscription from './pages/Subscription'
import Layout from './components/Layout'

function App() {
  return (
    <HealthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/symptoms" element={<SymptomTracker />} />
          <Route path="/content" element={<ContentLibrary />} />
          <Route path="/trends" element={<TrendAlerts />} />
          <Route path="/subscription" element={<Subscription />} />
        </Routes>
      </Layout>
    </HealthProvider>
  )
}

export default App