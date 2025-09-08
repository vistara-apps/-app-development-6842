import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO, subDays } from 'date-fns'

export default function SymptomChart({ symptoms }) {
  // Transform symptoms data for chart
  const chartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i)
      return {
        date: format(date, 'MMM dd'),
        symptoms: 0,
        severity: 0
      }
    }).reverse()

    symptoms.forEach(symptom => {
      const symptomDate = format(parseISO(symptom.timestamp), 'MMM dd')
      const dayData = last7Days.find(day => day.date === symptomDate)
      if (dayData) {
        dayData.symptoms += symptom.symptoms.length
        dayData.severity += symptom.symptoms.length * 2 // Mock severity calculation
      }
    })

    return last7Days
  }, [symptoms])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-dark-text">Symptom Trends</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-dark-textSecondary">Frequency</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span className="text-dark-textSecondary">Severity</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Line
              type="monotone"
              dataKey="symptoms"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="severity"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}