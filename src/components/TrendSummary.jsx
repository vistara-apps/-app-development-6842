import React from 'react'
import { TrendingUp, ExternalLink } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function TrendSummary({ alerts }) {
  const recentAlerts = alerts.slice(0, 3)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-dark-text flex items-center">
          <TrendingUp className="w-5 h-5 text-primary mr-2" />
          Health Trends
        </h2>
        <span className="text-sm text-primary cursor-pointer hover:underline">View All</span>
      </div>

      <div className="space-y-4">
        {recentAlerts.map((alert) => (
          <div key={alert.alertId} className="border border-dark-border rounded-lg p-4 hover:bg-dark-surfaceHover transition-colors duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-dark-text text-sm mb-1">{alert.title}</h3>
                <p className="text-dark-textSecondary text-xs mb-2 line-clamp-2">{alert.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-textSecondary">
                    {format(parseISO(alert.timestamp), 'MMM dd')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-accent font-medium">
                      {Math.round(alert.relevanceScore * 100)}% match
                    </span>
                    <ExternalLink className="w-3 h-3 text-dark-textSecondary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}