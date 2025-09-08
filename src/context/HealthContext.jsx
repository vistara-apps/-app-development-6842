import React, { createContext, useContext, useReducer, useEffect } from 'react'

const HealthContext = createContext()

const initialState = {
  user: {
    userId: 'user123',
    username: 'johndoe',
    selectedConditions: ['diabetes', 'hypertension'],
    subscriptionStatus: 'premium',
    notificationPreferences: {
      trends: true,
      patterns: true,
      subscriptions: true
    }
  },
  symptoms: [],
  trendAlerts: [],
  content: [],
  patterns: null,
  loading: false,
  error: null
}

function healthReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'ADD_SYMPTOM_LOG':
      return { 
        ...state, 
        symptoms: [action.payload, ...state.symptoms],
        loading: false 
      }
    case 'SET_SYMPTOMS':
      return { ...state, symptoms: action.payload, loading: false }
    case 'SET_TREND_ALERTS':
      return { ...state, trendAlerts: action.payload, loading: false }
    case 'SET_CONTENT':
      return { ...state, content: action.payload, loading: false }
    case 'SET_PATTERNS':
      return { ...state, patterns: action.payload, loading: false }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    default:
      return state
  }
}

export function HealthProvider({ children }) {
  const [state, dispatch] = useReducer(healthReducer, initialState)

  // Mock data initialization
  useEffect(() => {
    // Initialize with mock data
    const mockSymptoms = [
      {
        logId: '1',
        timestamp: new Date().toISOString(),
        symptoms: ['headache', 'fatigue'],
        triggers: ['stress', 'lack of sleep'],
        treatmentResponses: 'ibuprofen helped',
        notes: 'Started after work meeting'
      },
      {
        logId: '2',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        symptoms: ['nausea'],
        triggers: ['spicy food'],
        treatmentResponses: 'ginger tea helped',
        notes: 'After lunch'
      }
    ]

    const mockTrends = [
      {
        alertId: '1',
        timestamp: new Date().toISOString(),
        title: 'New Study: Mediterranean Diet Benefits for Diabetes',
        summary: 'Recent research shows significant improvements in blood sugar control with Mediterranean diet patterns.',
        sourceUrl: 'https://example.com/study1',
        relevanceScore: 0.95
      },
      {
        alertId: '2',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        title: 'FDA Approves New Hypertension Treatment',
        summary: 'A new medication combination shows promise for patients with resistant hypertension.',
        sourceUrl: 'https://example.com/study2',
        relevanceScore: 0.88
      }
    ]

    const mockContent = [
      {
        contentId: '1',
        title: 'Managing Blood Sugar Levels: A Complete Guide',
        type: 'article',
        summary: 'Comprehensive guide to understanding and managing blood glucose levels through diet, exercise, and medication.',
        relevantConditions: ['diabetes'],
        url: 'https://example.com/content1'
      },
      {
        contentId: '2',
        title: 'Understanding Hypertension Triggers',
        type: 'video',
        summary: 'Educational video explaining common triggers for high blood pressure and prevention strategies.',
        relevantConditions: ['hypertension'],
        url: 'https://example.com/content2'
      }
    ]

    dispatch({ type: 'SET_SYMPTOMS', payload: mockSymptoms })
    dispatch({ type: 'SET_TREND_ALERTS', payload: mockTrends })
    dispatch({ type: 'SET_CONTENT', payload: mockContent })
  }, [])

  const logSymptom = async (symptomData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const newLog = {
        logId: Date.now().toString(),
        userId: state.user.userId,
        timestamp: new Date().toISOString(),
        ...symptomData
      }
      dispatch({ type: 'ADD_SYMPTOM_LOG', payload: newLog })
      
      // Trigger pattern analysis after adding symptom
      analyzePatterns()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const analyzePatterns = async () => {
    try {
      // Mock AI pattern analysis
      const patterns = {
        commonTriggers: ['stress', 'lack of sleep', 'spicy food'],
        symptomFrequency: {
          'headache': 3,
          'fatigue': 2,
          'nausea': 1
        },
        recommendations: [
          'Consider stress management techniques',
          'Maintain regular sleep schedule',
          'Monitor food triggers'
        ]
      }
      dispatch({ type: 'SET_PATTERNS', payload: patterns })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const value = {
    ...state,
    logSymptom,
    analyzePatterns,
    dispatch
  }

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  )
}

export const useHealth = () => {
  const context = useContext(HealthContext)
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider')
  }
  return context
}