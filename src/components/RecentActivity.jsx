import React from 'react'
import { Activity, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function RecentActivity({ symptoms }) {
  const recentSymptoms = symptoms.slice(0, 5)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-dark-text flex items-center">
          <Activity className="w-5 h-5 text-primary mr-2" />
          Recent Activity
        </h2>
      </div>

      <div className="space-y-3">
        {recentSymptoms.map((symptom) => (
          <div key={symptom.logId} className="flex items-start space-x-3 p-3 border border-dark-border rounded-lg">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-dark-text">
                  {symptom.symptoms.join(', ')}
                </span>
              </div>
              {symptom.triggers.length > 0 && (
                <p className="text-xs text-dark-textSecondary mb-1">
                  Triggers: {symptom.triggers.join(', ')}
                </p>
              )}
              <div className="flex items-center space-x-2 text-xs text-dark-textSecondary">
                <Clock className="w-3 h-3" />
                <span>{format(parseISO(symptom.timestamp), 'MMM dd, HH:mm')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}