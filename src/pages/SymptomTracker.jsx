import React, { useState } from 'react'
import { useHealth } from '../context/HealthContext'
import SymptomForm from '../components/SymptomForm'
import SymptomHistory from '../components/SymptomHistory'
import { Plus } from 'lucide-react'

export default function SymptomTracker() {
  const [showForm, setShowForm] = useState(false)
  const { symptoms, patterns } = useHealth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Symptom Tracker</h1>
          <p className="text-dark-textSecondary mt-1">
            Log and track your symptoms to identify patterns
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log Symptom</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <SymptomForm onClose={() => setShowForm(false)} />
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SymptomHistory symptoms={symptoms} />
        </div>
        <div>
          {patterns && (
            <div className="card">
              <h2 className="text-lg font-semibold text-dark-text mb-4">Quick Insights</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-dark-text mb-2">Most Common</h3>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(patterns.symptomFrequency)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([symptom]) => (
                        <span key={symptom} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {symptom}
                        </span>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-dark-text mb-2">Top Triggers</h3>
                  <div className="flex flex-wrap gap-1">
                    {patterns.commonTriggers.slice(0, 3).map((trigger, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}