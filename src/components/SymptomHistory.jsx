import React from 'react'
import { format, parseISO } from 'date-fns'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SymptomHistory({ symptoms }) {
  if (symptoms.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-dark-textSecondary">
          <p>No symptoms logged yet.</p>
          <p className="text-sm mt-1">Start tracking to see patterns and insights.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-dark-text mb-4">Symptom History</h2>
      
      <div className="space-y-4">
        {symptoms.map((symptom) => (
          <div key={symptom.logId} className="border border-dark-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-dark-textSecondary" />
                <span className="text-sm text-dark-textSecondary">
                  {format(parseISO(symptom.timestamp), 'MMM dd, yyyy • HH:mm')}
                </span>
              </div>
            </div>

            {/* Symptoms */}
            <div className="mb-3">
              <h3 className="text-sm font-medium text-dark-text mb-2">Symptoms</h3>
              <div className="flex flex-wrap gap-1">
                {symptom.symptoms.map((s, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Triggers */}
            {symptom.triggers.length > 0 && (
              <div className="mb-3">
                <h3 className="text-sm font-medium text-dark-text mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                  Triggers
                </h3>
                <div className="flex flex-wrap gap-1">
                  {symptom.triggers.map((trigger, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-sm">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Response */}
            {symptom.treatmentResponses && (
              <div className="mb-3">
                <h3 className="text-sm font-medium text-dark-text mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent mr-1" />
                  Treatment Response
                </h3>
                <p className="text-sm text-dark-textSecondary">{symptom.treatmentResponses}</p>
              </div>
            )}

            {/* Notes */}
            {symptom.notes && (
              <div>
                <h3 className="text-sm font-medium text-dark-text mb-2">Notes</h3>
                <p className="text-sm text-dark-textSecondary">{symptom.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}