import React from 'react'
import { Bell, Search, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-textSecondary w-4 h-4" />
            <input
              type="text"
              placeholder="Search health content..."
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-dark-textSecondary hover:text-dark-text transition-colors duration-200">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-dark-textSecondary hover:text-dark-text transition-colors duration-200">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}