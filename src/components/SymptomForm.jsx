import React, { useState } from 'react'
import { useHealth } from '../context/HealthContext'
import { X, Plus, Minus } from 'lucide-react'

const commonSymptoms = [
  'headache', 'fatigue', 'nausea', 'dizziness', 'pain', 'anxiety', 'insomnia', 'fever'
]

const commonTriggers = [
  'stress', 'lack of sleep', 'weather change', 'food', 'exercise', 'medication', 'environment'
]

export default function SymptomForm({ onClose }) {
  const { logSymptom, loading } = useHealth()
  const [formData, setFormData] = useState({
    symptoms: [],
    triggers: [],
    treatmentResponses: '',
    notes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.symptoms.length === 0) return
    
    await logSymptom(formData)
    onClose()
  }

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }))
  }

  const toggleTrigger = (trigger) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-semibold text-dark-text">Log Symptom</h2>
          <button
            onClick={onClose}
            className="p-1 text-dark-textSecondary hover:text-dark-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-3">
              What symptoms are you experiencing? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`p-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    formData.symptoms.includes(symptom)
                      ? 'bg-primary text-white'
                      : 'bg-dark-bg text-dark-textSecondary hover:text-dark-text hover:bg-dark-surfaceHover border border-dark-border'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-3">
              Potential triggers
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {commonTriggers.map((trigger) => (
                <button
                  key={trigger}
                  type="button"
                  onClick={() => toggleTrigger(trigger)}
                  className={`p-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    formData.triggers.includes(trigger)
                      ? 'bg-orange-500 text-white'
                      : 'bg-dark-bg text-dark-textSecondary hover:text-dark-text hover:bg-dark-surfaceHover border border-dark-border'
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          {/* Treatment Response */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Treatment response
            </label>
            <input
              type="text"
              value={formData.treatmentResponses}
              onChange={(e) => setFormData(prev => ({ ...prev, treatmentResponses: e.target.value }))}
              placeholder="What helped or didn't help?"
              className="input w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Additional notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional details..."
              rows={3}
              className="input w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.symptoms.length === 0 || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging...' : 'Log Symptom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}