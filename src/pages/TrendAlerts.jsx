import React, { useState } from 'react'
import { useHealth } from '../context/HealthContext'
import { TrendingUp, ExternalLink, Calendar, Target, Bell } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function TrendAlerts() {
  const { trendAlerts, user } = useHealth()
  const [filter, setFilter] = useState('all')

  const filteredAlerts = trendAlerts.filter(alert => {
    if (filter === 'high-relevance') {
      return alert.relevanceScore >= 0.8
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Health Trend Alerts</h1>
          <p className="text-dark-textSecondary mt-1">
            AI-curated health updates relevant to your conditions
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Alerts</option>
            <option value="high-relevance">High Relevance (80%+)</option>
          </select>
          <button className="btn-secondary flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-dark-text mb-4">Notification Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border border-dark-border rounded-lg">
            <div>
              <h3 className="font-medium text-dark-text">New Research</h3>
              <p className="text-sm text-dark-textSecondary">Latest studies</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={user.notificationPreferences.trends}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-dark-border rounded-lg">
            <div>
              <h3 className="font-medium text-dark-text">Treatment Updates</h3>
              <p className="text-sm text-dark-textSecondary">New treatments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={user.notificationPreferences.trends}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-dark-border rounded-lg">
            <div>
              <h3 className="font-medium text-dark-text">Breaking News</h3>
              <p className="text-sm text-dark-textSecondary">Urgent updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={user.notificationPreferences.trends}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.alertId} className="card hover:bg-dark-surfaceHover transition-colors duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-dark-textSecondary" />
                    <span className="text-sm text-dark-textSecondary">
                      {format(parseISO(alert.timestamp), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">
                      {Math.round(alert.relevanceScore * 100)}% relevance
                    </span>
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-dark-textSecondary group-hover:text-dark-text transition-colors duration-200" />
            </div>

            <h3 className="text-lg font-semibold text-dark-text mb-2">
              {alert.title}
            </h3>
            
            <p className="text-dark-textSecondary mb-4 leading-relaxed">
              {alert.summary}
            </p>

            <div className="flex items-center justify-between">
              <button className="btn-primary">
                Read Full Article
              </button>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-dark-textSecondary hover:text-dark-text transition-colors duration-200">
                  <span className="text-sm">Save</span>
                </button>
                <button className="p-2 text-dark-textSecondary hover:text-dark-text transition-colors duration-200">
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-dark-textSecondary mx-auto mb-4" />
          <div className="text-dark-textSecondary">
            <p>No trend alerts found.</p>
            <p className="text-sm mt-1">Check back later for new health updates.</p>
          </div>
        </div>
      )}
    </div>
  )
}