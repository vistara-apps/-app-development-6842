import { supabaseService } from './supabase'
import { openaiService } from './openai'
import { pinataService } from './pinata'
import { stripeService } from './stripe'
import { farcasterService } from './farcaster'
import { privyService } from './privy'

// Main API service that orchestrates all other services
export const apiService = {
  // User management
  async createUser(userData) {
    try {
      // Create user in Supabase
      const user = await supabaseService.createUser(userData)
      
      // Upload user profile to IPFS for backup
      await pinataService.uploadHealthProfile(user)
      
      return user
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  async getUser(userId) {
    try {
      return await supabaseService.getUser(userId)
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  },

  async updateUser(userId, updates) {
    try {
      const updatedUser = await supabaseService.updateUser(userId, updates)
      
      // Backup updated profile to IPFS
      await pinataService.uploadHealthProfile(updatedUser)
      
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  // Symptom logging with AI analysis
  async logSymptom(symptomData) {
    try {
      // Save to Supabase
      const symptomLog = await supabaseService.createSymptomLog(symptomData)
      
      // Get user's recent symptoms for pattern analysis
      const recentSymptoms = await supabaseService.getSymptomLogs(
        symptomData.userId, 
        20
      )
      
      // Get user profile for AI context
      const user = await supabaseService.getUser(symptomData.userId)
      
      // Analyze patterns with AI if user has premium
      let patterns = null
      if (user.subscriptionStatus === 'premium') {
        patterns = await openaiService.analyzeSymptomPatterns(
          recentSymptoms,
          user.selectedConditions
        )
      }
      
      // Backup symptoms to IPFS periodically (every 10 logs)
      if (recentSymptoms.length % 10 === 0) {
        await pinataService.uploadSymptomData(recentSymptoms, symptomData.userId)
      }
      
      return {
        symptomLog,
        patterns,
        totalLogs: recentSymptoms.length
      }
    } catch (error) {
      console.error('Error logging symptom:', error)
      throw error
    }
  },

  async getSymptomHistory(userId, limit = 50) {
    try {
      return await supabaseService.getSymptomLogs(userId, limit)
    } catch (error) {
      console.error('Error getting symptom history:', error)
      throw error
    }
  },

  // Health trend alerts with AI generation
  async generateHealthTrendAlert(researchData, userId) {
    try {
      // Get user profile for personalization
      const user = await supabaseService.getUser(userId)
      
      // Generate AI-powered alert
      const alertData = await openaiService.generateHealthTrendAlert(
        researchData,
        user.selectedConditions
      )
      
      // Save to database
      const alert = await supabaseService.createHealthTrendAlert({
        ...alertData,
        userId,
        timestamp: new Date().toISOString()
      })
      
      // Send Farcaster notification if user opted in
      if (user.notificationPreferences.trends) {
        await farcasterService.sendTrendNotification(userId, alert)
      }
      
      return alert
    } catch (error) {
      console.error('Error generating health trend alert:', error)
      throw error
    }
  },

  async getHealthTrendAlerts(userId, limit = 20) {
    try {
      return await supabaseService.getHealthTrendAlerts(userId, limit)
    } catch (error) {
      console.error('Error getting health trend alerts:', error)
      throw error
    }
  },

  // Content management with IPFS storage
  async createHealthContent(contentData) {
    try {
      // Upload content to IPFS
      const ipfsResult = await pinataService.uploadHealthContent(contentData)
      
      // Save metadata to Supabase with IPFS hash
      const content = await supabaseService.createContent({
        ...contentData,
        ipfsHash: ipfsResult.hash,
        ipfsUrl: ipfsResult.url,
        createdAt: new Date().toISOString()
      })
      
      return content
    } catch (error) {
      console.error('Error creating health content:', error)
      throw error
    }
  },

  async getHealthContent(userConditions = [], limit = 50) {
    try {
      return await supabaseService.getContent(userConditions, limit)
    } catch (error) {
      console.error('Error getting health content:', error)
      throw error
    }
  },

  async summarizeContent(contentText, userConditions) {
    try {
      return await openaiService.summarizeHealthContent(contentText, userConditions)
    } catch (error) {
      console.error('Error summarizing content:', error)
      throw error
    }
  },

  // Subscription management
  async createSubscription(planId, userId, paymentMethod = 'stripe') {
    try {
      if (paymentMethod === 'crypto') {
        // Handle crypto payment via Privy
        const user = await this.getUser(userId)
        const result = await privyService.handleSubscriptionPayment(planId, user)
        
        // Update user subscription status
        await this.updateUser(userId, {
          subscriptionStatus: planId,
          subscriptionExpiresAt: result.subscription.nextBillingDate,
          paymentMethod: 'crypto'
        })
        
        return result
      } else {
        // Handle fiat payment via Stripe
        const successUrl = `${import.meta.env.VITE_APP_URL}/subscription/success`
        const cancelUrl = `${import.meta.env.VITE_APP_URL}/subscription/cancel`
        
        await stripeService.createSubscriptionCheckout(
          stripeService.pricing[planId].priceId,
          userId,
          successUrl,
          cancelUrl
        )
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  },

  async getSubscriptionStatus(userId) {
    try {
      const user = await this.getUser(userId)
      return await privyService.checkPremiumStatus(user)
    } catch (error) {
      console.error('Error getting subscription status:', error)
      throw error
    }
  },

  // AI-powered insights
  async generatePersonalizedTips(userId) {
    try {
      const user = await this.getUser(userId)
      const recentSymptoms = await this.getSymptomHistory(userId, 10)
      
      return await openaiService.generatePersonalizedTips(user, recentSymptoms)
    } catch (error) {
      console.error('Error generating personalized tips:', error)
      throw error
    }
  },

  // Farcaster frame interactions
  async handleFrameAction(frameData) {
    try {
      return await farcasterService.handleFrameInteraction(frameData)
    } catch (error) {
      console.error('Error handling frame action:', error)
      throw error
    }
  },

  async sendSymptomReminder(userId) {
    try {
      return await farcasterService.sendSymptomReminder(userId)
    } catch (error) {
      console.error('Error sending symptom reminder:', error)
      throw error
    }
  },

  // Data export and backup
  async exportUserData(userId, format = 'json') {
    try {
      const user = await this.getUser(userId)
      const symptoms = await this.getSymptomHistory(userId, 1000)
      const alerts = await this.getHealthTrendAlerts(userId, 100)
      
      const exportData = {
        user,
        symptoms,
        alerts,
        exportedAt: new Date().toISOString(),
        format
      }
      
      if (format === 'ipfs') {
        // Upload to IPFS and return hash
        const result = await pinataService.uploadJSON(exportData, {
          name: `HealthSync Export - ${userId}`,
          type: 'data-export'
        })
        return result
      }
      
      return exportData
    } catch (error) {
      console.error('Error exporting user data:', error)
      throw error
    }
  },

  // Health conditions management
  async getAvailableConditions() {
    try {
      return await supabaseService.getConditions()
    } catch (error) {
      console.error('Error getting available conditions:', error)
      throw error
    }
  },

  // Analytics and insights
  async getHealthAnalytics(userId, timeRange = '30d') {
    try {
      const symptoms = await this.getSymptomHistory(userId, 100)
      const user = await this.getUser(userId)
      
      // Calculate basic analytics
      const analytics = {
        totalLogs: symptoms.length,
        timeRange,
        mostCommonSymptoms: this.calculateSymptomFrequency(symptoms),
        mostCommonTriggers: this.calculateTriggerFrequency(symptoms),
        loggingStreak: this.calculateLoggingStreak(symptoms),
        healthScore: this.calculateHealthScore(symptoms, user)
      }
      
      // Generate AI insights for premium users
      if (user.subscriptionStatus === 'premium') {
        analytics.aiInsights = await openaiService.analyzeSymptomPatterns(
          symptoms,
          user.selectedConditions
        )
      }
      
      return analytics
    } catch (error) {
      console.error('Error getting health analytics:', error)
      throw error
    }
  },

  // Helper methods for analytics
  calculateSymptomFrequency(symptoms) {
    const frequency = {}
    symptoms.forEach(log => {
      log.symptoms.forEach(symptom => {
        frequency[symptom] = (frequency[symptom] || 0) + 1
      })
    })
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }))
  },

  calculateTriggerFrequency(symptoms) {
    const frequency = {}
    symptoms.forEach(log => {
      log.triggers.forEach(trigger => {
        frequency[trigger] = (frequency[trigger] || 0) + 1
      })
    })
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }))
  },

  calculateLoggingStreak(symptoms) {
    if (symptoms.length === 0) return 0
    
    const dates = symptoms.map(s => new Date(s.timestamp).toDateString())
    const uniqueDates = [...new Set(dates)].sort()
    
    let streak = 1
    for (let i = 1; i < uniqueDates.length; i++) {
      const current = new Date(uniqueDates[i])
      const previous = new Date(uniqueDates[i - 1])
      const diffDays = (current - previous) / (1000 * 60 * 60 * 24)
      
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  },

  calculateHealthScore(symptoms, user) {
    // Simple health score calculation based on various factors
    let score = 100
    
    // Reduce score based on symptom frequency
    const recentSymptoms = symptoms.slice(0, 7) // Last 7 logs
    score -= recentSymptoms.length * 2
    
    // Increase score for consistent logging
    const loggingStreak = this.calculateLoggingStreak(symptoms)
    score += Math.min(loggingStreak * 2, 20)
    
    // Adjust based on subscription (premium users get better tracking)
    if (user.subscriptionStatus === 'premium') {
      score += 5
    }
    
    return Math.max(0, Math.min(100, score))
  }
}
