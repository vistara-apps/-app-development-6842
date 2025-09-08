import React from 'react'
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react'

export default function HealthInsights({ patterns }) {
  if (!patterns) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-dark-text">AI Health Insights</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-dark-textSecondary">Log more symptoms to generate AI insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold text-dark-text">AI Health Insights</h2>
      </div>

      <div className="space-y-6">
        {/* Common Triggers */}
        <div>
          <h3 className="font-medium text-dark-text mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
            Common Triggers
          </h3>
          <div className="flex flex-wrap gap-2">
            {patterns.commonTriggers.map((trigger, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm border border-orange-500/20"
              >
                {trigger}
              </span>
            ))}
          </div>
        </div>

        {/* Symptom Frequency */}
        <div>
          <h3 className="font-medium text-dark-text mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 text-accent mr-2" />
            Symptom Frequency
          </h3>
          <div className="space-y-3">
            {Object.entries(patterns.symptomFrequency).map(([symptom, count]) => (
              <div key={symptom} className="flex items-center justify-between">
                <span className="text-dark-textSecondary capitalize">{symptom}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-dark-bg rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${(count / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-dark-text w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="font-medium text-dark-text mb-3">AI Recommendations</h3>
          <ul className="space-y-2">
            {patterns.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-dark-textSecondary text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}