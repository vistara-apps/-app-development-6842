import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home,
  Activity,
  BookOpen,
  TrendingUp,
  CreditCard,
  Heart
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Symptom Tracker', href: '/symptoms', icon: Activity },
  { name: 'Content Library', href: '/content', icon: BookOpen },
  { name: 'Trend Alerts', href: '/trends', icon: TrendingUp },
  { name: 'Subscription', href: '/subscription', icon: CreditCard },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-dark-surface border-r border-dark-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary rounded-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-text">HealthSync AI</h1>
            <p className="text-sm text-dark-textSecondary">Your Health Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-dark-textSecondary hover:text-dark-text hover:bg-dark-surfaceHover'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-dark-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">J</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-text">John Doe</p>
            <p className="text-xs text-dark-textSecondary">Premium Member</p>
          </div>
        </div>
      </div>
    </div>
  )
}