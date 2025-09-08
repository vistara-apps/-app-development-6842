import React, { useState } from 'react'
import { useHealth } from '../context/HealthContext'
import { Search, Filter, ExternalLink, PlayCircle, FileText, Microscope } from 'lucide-react'

const typeIcons = {
  article: FileText,
  video: PlayCircle,
  research: Microscope
}

export default function ContentLibrary() {
  const { content, user } = useHealth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCondition, setSelectedCondition] = useState('all')

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || item.type === selectedType
    const matchesCondition = selectedCondition === 'all' || 
                            item.relevantConditions.includes(selectedCondition)
    
    return matchesSearch && matchesType && matchesCondition
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-text">Content Library</h1>
        <p className="text-dark-textSecondary mt-1">
          Curated health content tailored to your conditions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-textSecondary w-4 h-4" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-10"
          />
        </div>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="input"
        >
          <option value="all">All Types</option>
          <option value="article">Articles</option>
          <option value="video">Videos</option>
          <option value="research">Research</option>
        </select>

        {/* Condition Filter */}
        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="input"
        >
          <option value="all">All Conditions</option>
          {user.selectedConditions.map(condition => (
            <option key={condition} value={condition}>
              {condition.charAt(0).toUpperCase() + condition.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => {
          const IconComponent = typeIcons[item.type]
          return (
            <div key={item.contentId} className="card hover:bg-dark-surfaceHover transition-colors duration-200 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    {item.type}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-dark-textSecondary group-hover:text-dark-text transition-colors duration-200" />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-dark-text mb-2 line-clamp-2">
                {item.title}
              </h3>
              
              <p className="text-sm text-dark-textSecondary mb-4 line-clamp-3">
                {item.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {item.relevantConditions.map(condition => (
                  <span
                    key={condition}
                    className="px-2 py-1 bg-accent/10 text-accent rounded text-xs"
                  >
                    {condition}
                  </span>
                ))}
              </div>

              {/* Action */}
              <button className="w-full btn-secondary text-sm">
                View Content
              </button>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <div className="text-dark-textSecondary">
            <p>No content found matching your filters.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        </div>
      )}
    </div>
  )
}