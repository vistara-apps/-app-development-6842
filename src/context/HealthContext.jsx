import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import toast from 'react-hot-toast'
import { apiService } from '../services/api'
import { privyService } from '../services/privy'

const HealthContext = createContext()

const initialState = {
  user: null,
  symptoms: [],
  trendAlerts: [],
  content: [],
  conditions: [],
  patterns: null,
  analytics: null,
  subscriptionStatus: null,
  loading: false,
  error: null,
  isAuthenticated: false
}

function healthReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
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
    case 'SET_CONDITIONS':
      return { ...state, conditions: action.payload, loading: false }
    case 'SET_PATTERNS':
      return { ...state, patterns: action.payload, loading: false }
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload, loading: false }
    case 'SET_SUBSCRIPTION_STATUS':
      return { ...state, subscriptionStatus: action.payload, loading: false }
    default:
      return state
  }
}

export function HealthProvider({ children }) {
  const [state, dispatch] = useReducer(healthReducer, initialState)
  const { user: privyUser, authenticated, login, logout } = usePrivy()

  // Initialize user data when Privy authentication changes
  useEffect(() => {
    const initializeUser = async () => {
      if (authenticated && privyUser) {
        dispatch({ type: 'SET_LOADING', payload: true })
        try {
          // Check if user exists in our database
          let userData
          try {
            userData = await apiService.getUser(privyUser.id)
          } catch (error) {
            // User doesn't exist, create new user
            const newUserData = await privyService.onAuthSuccess(privyUser, true)
            userData = await apiService.createUser(newUserData)
            toast.success('Welcome to HealthSync AI! 🎉')
          }

          dispatch({ type: 'SET_USER', payload: userData })
          
          // Load user's data
          await loadUserData(userData.userId)
          
        } catch (error) {
          console.error('Error initializing user:', error)
          dispatch({ type: 'SET_ERROR', payload: error.message })
          toast.error('Failed to initialize user data')
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null })
        dispatch({ type: 'SET_AUTHENTICATED', payload: false })
      }
    }

    initializeUser()
  }, [authenticated, privyUser])

  // Load available conditions on mount
  useEffect(() => {
    const loadConditions = async () => {
      try {
        const conditions = await apiService.getAvailableConditions()
        dispatch({ type: 'SET_CONDITIONS', payload: conditions })
      } catch (error) {
        console.error('Error loading conditions:', error)
      }
    }

    loadConditions()
  }, [])

  const loadUserData = async (userId) => {
    try {
      // Load symptoms
      const symptoms = await apiService.getSymptomHistory(userId)
      dispatch({ type: 'SET_SYMPTOMS', payload: symptoms })

      // Load trend alerts
      const alerts = await apiService.getHealthTrendAlerts(userId)
      dispatch({ type: 'SET_TREND_ALERTS', payload: alerts })

      // Load content based on user's conditions
      const user = await apiService.getUser(userId)
      const content = await apiService.getHealthContent(user.selectedConditions)
      dispatch({ type: 'SET_CONTENT', payload: content })

      // Load analytics for premium users
      if (user.subscriptionStatus === 'premium') {
        const analytics = await apiService.getHealthAnalytics(userId)
        dispatch({ type: 'SET_ANALYTICS', payload: analytics })
      }

      // Load subscription status
      const subscriptionStatus = await apiService.getSubscriptionStatus(userId)
      dispatch({ type: 'SET_SUBSCRIPTION_STATUS', payload: subscriptionStatus })

    } catch (error) {
      console.error('Error loading user data:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const logSymptom = async (symptomData) => {
    if (!state.user) {
      toast.error('Please log in to track symptoms')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const logData = {
        logId: `log_${Date.now()}`,
        userId: state.user.userId,
        timestamp: new Date().toISOString(),
        ...symptomData
      }

      const result = await apiService.logSymptom(logData)
      dispatch({ type: 'ADD_SYMPTOM_LOG', payload: result.symptomLog })
      
      // Update patterns if AI analysis was performed
      if (result.patterns) {
        dispatch({ type: 'SET_PATTERNS', payload: result.patterns })
      }

      toast.success('Symptom logged successfully! 📝')
      
    } catch (error) {
      console.error('Error logging symptom:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to log symptom')
    }
  }

  const analyzePatterns = async () => {
    if (!state.user || state.user.subscriptionStatus !== 'premium') {
      toast.error('Premium subscription required for AI pattern analysis')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const analytics = await apiService.getHealthAnalytics(state.user.userId)
      dispatch({ type: 'SET_ANALYTICS', payload: analytics })
      
      if (analytics.aiInsights) {
        dispatch({ type: 'SET_PATTERNS', payload: analytics.aiInsights })
        toast.success('Pattern analysis complete! 🧠')
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to analyze patterns')
    }
  }

  const updateUserProfile = async (updates) => {
    if (!state.user) return

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const updatedUser = await apiService.updateUser(state.user.userId, updates)
      dispatch({ type: 'UPDATE_USER', payload: updatedUser })
      toast.success('Profile updated successfully! ✅')
      
      // Reload content if conditions changed
      if (updates.selectedConditions) {
        const content = await apiService.getHealthContent(updates.selectedConditions)
        dispatch({ type: 'SET_CONTENT', payload: content })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to update profile')
    }
  }

  const createSubscription = async (planId, paymentMethod = 'stripe') => {
    if (!state.user) {
      toast.error('Please log in to subscribe')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      await apiService.createSubscription(planId, state.user.userId, paymentMethod)
      
      // Reload subscription status
      const subscriptionStatus = await apiService.getSubscriptionStatus(state.user.userId)
      dispatch({ type: 'SET_SUBSCRIPTION_STATUS', payload: subscriptionStatus })
      
      // Update user subscription status
      dispatch({ type: 'UPDATE_USER', payload: { subscriptionStatus: planId } })
      
      toast.success('Subscription activated! 🎉')
    } catch (error) {
      console.error('Error creating subscription:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to create subscription')
    }
  }

  const generatePersonalizedTips = async () => {
    if (!state.user) return

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const tips = await apiService.generatePersonalizedTips(state.user.userId)
      toast.success('Personalized tips generated! 💡')
      return tips
    } catch (error) {
      console.error('Error generating tips:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to generate tips')
    }
  }

  const exportUserData = async (format = 'json') => {
    if (!state.user) return

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const exportData = await apiService.exportUserData(state.user.userId, format)
      toast.success('Data exported successfully! 📊')
      return exportData
    } catch (error) {
      console.error('Error exporting data:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to export data')
    }
  }

  const value = {
    ...state,
    // Authentication
    login,
    logout,
    // Core functions
    logSymptom,
    analyzePatterns,
    updateUserProfile,
    createSubscription,
    generatePersonalizedTips,
    exportUserData,
    loadUserData,
    // Utility
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
