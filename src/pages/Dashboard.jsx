import React from 'react'
import { useHealth } from '../context/HealthContext'
import SymptomChart from '../components/SymptomChart'
import RecentActivity from '../components/RecentActivity'
import QuickActions from '../components/QuickActions'
import HealthInsights from '../components/HealthInsights'
import TrendSummary from '../components/TrendSummary'

export default function Dashboard() {
  const { user, symptoms, trendAlerts, patterns } = useHealth()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-text">
            Welcome back, {user.username}
          </h1>
          <p className="text-dark-textSecondary mt-1">
            Here's your health overview for today
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="text-sm text-accent font-medium">Health Score</div>
            <div className="text-2xl font-bold text-dark-text mt-1">78/100</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Data */}
        <div className="lg:col-span-2 space-y-6">
          <SymptomChart symptoms={symptoms} />
          <HealthInsights patterns={patterns} />
        </div>

        {/* Right Column - Activity and Trends */}
        <div className="space-y-6">
          <TrendSummary alerts={trendAlerts} />
          <RecentActivity symptoms={symptoms} />
        </div>
      </div>
    </div>
  )
}