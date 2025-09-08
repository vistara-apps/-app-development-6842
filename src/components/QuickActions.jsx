import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, TrendingUp, Activity } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      name: 'Log Symptom',
      href: '/symptoms',
      icon: Plus,
      color: 'bg-primary',
      description: 'Track new symptoms'
    },
    {
      name: 'Browse Content',
      href: '/content',
      icon: BookOpen,
      color: 'bg-accent',
      description: 'Health articles & videos'
    },
    {
      name: 'View Trends',
      href: '/trends',
      icon: TrendingUp,
      color: 'bg-purple-600',
      description: 'Latest health alerts'
    },
    {
      name: 'View Patterns',
      href: '/symptoms',
      icon: Activity,
      color: 'bg-orange-600',
      description: 'Analyze symptoms'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.name}
          to={action.href}
          className="card hover:bg-dark-surfaceHover transition-colors duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-dark-text">{action.name}</h3>
              <p className="text-sm text-dark-textSecondary">{action.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}