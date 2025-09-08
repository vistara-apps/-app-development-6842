import axios from 'axios'

const NEYNAR_API_KEY = import.meta.env.VITE_NEYNAR_API_KEY
const FARCASTER_HUB_URL = import.meta.env.VITE_FARCASTER_HUB_URL
const APP_URL = import.meta.env.VITE_APP_URL
const FRAME_URL = import.meta.env.VITE_FRAME_URL

const neynarAxios = axios.create({
  baseURL: 'https://api.neynar.com/v2',
  headers: {
    'api_key': NEYNAR_API_KEY,
    'Content-Type': 'application/json'
  }
})

export const farcasterService = {
  // Create a cast with health content
  async createHealthCast(text, embeds = []) {
    try {
      const response = await neynarAxios.post('/farcaster/cast', {
        text,
        embeds,
        parent: null
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating health cast:', error)
      throw error
    }
  },

  // Create symptom logging frame
  createSymptomFrame() {
    return {
      version: "vNext",
      image: `${FRAME_URL}/images/symptom-log.png`,
      buttons: [
        {
          label: "Log Symptom",
          action: "post",
          target: `${FRAME_URL}/api/log-symptom`
        },
        {
          label: "View History",
          action: "post",
          target: `${FRAME_URL}/api/symptom-history`
        }
      ],
      input: {
        text: "Describe your symptoms..."
      },
      post_url: `${FRAME_URL}/api/symptom-frame`
    }
  },

  // Create health trend alert frame
  createTrendAlertFrame(alert) {
    return {
      version: "vNext",
      image: `${FRAME_URL}/images/trend-alert.png`,
      buttons: [
        {
          label: "Read More",
          action: "link",
          target: alert.sourceUrl
        },
        {
          label: "Save Alert",
          action: "post",
          target: `${FRAME_URL}/api/save-alert`
        },
        {
          label: "Dismiss",
          action: "post",
          target: `${FRAME_URL}/api/dismiss-alert`
        }
      ],
      post_url: `${FRAME_URL}/api/trend-frame`
    }
  },

  // Create content discovery frame
  createContentFrame(content) {
    return {
      version: "vNext",
      image: `${FRAME_URL}/images/content-preview.png`,
      buttons: [
        {
          label: "Read Article",
          action: "link",
          target: content.url
        },
        {
          label: "Save for Later",
          action: "post",
          target: `${FRAME_URL}/api/save-content`
        },
        {
          label: "More Content",
          action: "post",
          target: `${FRAME_URL}/api/browse-content`
        }
      ],
      post_url: `${FRAME_URL}/api/content-frame`
    }
  },

  // Send health trend notification
  async sendTrendNotification(userId, alert) {
    try {
      const frameMetadata = this.createTrendAlertFrame(alert)
      
      const castText = `🚨 New Health Trend Alert: ${alert.title}\n\n${alert.summary}\n\nRelevance Score: ${Math.round(alert.relevanceScore * 100)}%`
      
      const response = await this.createHealthCast(castText, [
        {
          url: `${FRAME_URL}/trend/${alert.alertId}`,
          metadata: frameMetadata
        }
      ])
      
      return response
    } catch (error) {
      console.error('Error sending trend notification:', error)
      throw error
    }
  },

  // Send symptom reminder
  async sendSymptomReminder(userId) {
    try {
      const frameMetadata = this.createSymptomFrame()
      
      const castText = `📝 Time to log your symptoms! Track your health patterns with HealthSync AI.`
      
      const response = await this.createHealthCast(castText, [
        {
          url: `${FRAME_URL}/symptom-log`,
          metadata: frameMetadata
        }
      ])
      
      return response
    } catch (error) {
      console.error('Error sending symptom reminder:', error)
      throw error
    }
  },

  // Get user's Farcaster profile
  async getUserProfile(fid) {
    try {
      const response = await neynarAxios.get(`/farcaster/user/bulk?fids=${fid}`)
      return response.data.users[0]
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  },

  // Verify frame signature
  async verifyFrameSignature(frameData) {
    try {
      const response = await neynarAxios.post('/farcaster/frame/validate', frameData)
      return response.data.valid
    } catch (error) {
      console.error('Error verifying frame signature:', error)
      return false
    }
  },

  // Handle frame interactions
  async handleFrameInteraction(frameData) {
    try {
      // Verify the frame signature first
      const isValid = await this.verifyFrameSignature(frameData)
      if (!isValid) {
        throw new Error('Invalid frame signature')
      }

      const { buttonIndex, inputText, fid } = frameData
      
      // Handle different frame actions based on button pressed
      switch (buttonIndex) {
        case 1: // Log Symptom
          return await this.handleSymptomLog(fid, inputText)
        case 2: // View History
          return await this.handleViewHistory(fid)
        case 3: // Save Alert/Content
          return await this.handleSaveAction(fid, frameData)
        default:
          throw new Error('Unknown frame action')
      }
    } catch (error) {
      console.error('Error handling frame interaction:', error)
      throw error
    }
  },

  // Handle symptom logging from frame
  async handleSymptomLog(fid, symptomText) {
    try {
      // Parse symptom text and create log entry
      const symptomData = {
        symptoms: [symptomText],
        triggers: [],
        treatmentResponses: '',
        notes: `Logged via Farcaster frame`,
        timestamp: new Date().toISOString(),
        userId: `fc_${fid}` // Use Farcaster ID as user identifier
      }

      // This would integrate with your symptom logging service
      // For now, return success response
      return {
        success: true,
        message: 'Symptom logged successfully!',
        nextFrame: this.createSymptomFrame()
      }
    } catch (error) {
      console.error('Error handling symptom log:', error)
      throw error
    }
  },

  // Handle view history from frame
  async handleViewHistory(fid) {
    try {
      // Get user's symptom history
      // This would integrate with your data service
      
      return {
        success: true,
        message: 'Redirecting to symptom history...',
        redirect: `${APP_URL}/symptoms?fid=${fid}`
      }
    } catch (error) {
      console.error('Error handling view history:', error)
      throw error
    }
  },

  // Handle save actions from frame
  async handleSaveAction(fid, frameData) {
    try {
      // Handle saving alerts or content
      return {
        success: true,
        message: 'Saved successfully!',
        nextFrame: frameData.originalFrame
      }
    } catch (error) {
      console.error('Error handling save action:', error)
      throw error
    }
  },

  // Create frame image URLs
  frameImages: {
    symptomLog: `${FRAME_URL}/images/symptom-log.png`,
    trendAlert: `${FRAME_URL}/images/trend-alert.png`,
    contentPreview: `${FRAME_URL}/images/content-preview.png`,
    dashboard: `${FRAME_URL}/images/dashboard.png`
  },

  // Frame endpoints
  frameEndpoints: {
    symptomLog: `${FRAME_URL}/api/log-symptom`,
    trendAlert: `${FRAME_URL}/api/trend-alert`,
    contentFrame: `${FRAME_URL}/api/content-frame`,
    dashboard: `${FRAME_URL}/api/dashboard`
  }
}
