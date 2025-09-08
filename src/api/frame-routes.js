// API routes for Farcaster frame interactions
// These would typically be implemented as serverless functions or API endpoints

import { farcasterService } from '../services/farcaster'
import { apiService } from '../services/api'

// Frame endpoint handlers
export const frameRoutes = {
  // Handle symptom logging frame
  async handleSymptomFrame(req, res) {
    try {
      const { fid, buttonIndex, inputText, untrustedData } = req.body
      
      // Verify frame signature
      const isValid = await farcasterService.verifyFrameSignature(req.body)
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid frame signature' })
      }

      let responseFrame
      
      switch (buttonIndex) {
        case 1: // Log Symptom
          if (!inputText) {
            responseFrame = {
              ...farcasterService.createSymptomFrame(),
              image: `${process.env.VITE_FRAME_URL}/images/error.png`,
              buttons: [
                {
                  label: "Try Again",
                  action: "post",
                  target: `${process.env.VITE_FRAME_URL}/api/symptom-frame`
                }
              ]
            }
          } else {
            // Log the symptom
            const symptomData = {
              symptoms: [inputText],
              triggers: [],
              treatmentResponses: '',
              notes: 'Logged via Farcaster frame',
              userId: `fc_${fid}`
            }
            
            await apiService.logSymptom(symptomData)
            
            responseFrame = {
              version: "vNext",
              image: `${process.env.VITE_FRAME_URL}/images/success.png`,
              buttons: [
                {
                  label: "Log Another",
                  action: "post",
                  target: `${process.env.VITE_FRAME_URL}/api/symptom-frame`
                },
                {
                  label: "View Dashboard",
                  action: "link",
                  target: `${process.env.VITE_APP_URL}/dashboard?fid=${fid}`
                }
              ]
            }
          }
          break
          
        case 2: // View History
          responseFrame = {
            version: "vNext",
            image: `${process.env.VITE_FRAME_URL}/images/history.png`,
            buttons: [
              {
                label: "Open App",
                action: "link",
                target: `${process.env.VITE_APP_URL}/symptoms?fid=${fid}`
              },
              {
                label: "Back",
                action: "post",
                target: `${process.env.VITE_FRAME_URL}/api/symptom-frame`
              }
            ]
          }
          break
          
        default:
          responseFrame = farcasterService.createSymptomFrame()
      }

      res.status(200).json(responseFrame)
    } catch (error) {
      console.error('Error handling symptom frame:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  // Handle trend alert frame
  async handleTrendFrame(req, res) {
    try {
      const { fid, buttonIndex, untrustedData } = req.body
      
      const isValid = await farcasterService.verifyFrameSignature(req.body)
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid frame signature' })
      }

      let responseFrame
      
      switch (buttonIndex) {
        case 2: // Save Alert
          // Save alert for user
          responseFrame = {
            version: "vNext",
            image: `${process.env.VITE_FRAME_URL}/images/saved.png`,
            buttons: [
              {
                label: "View Saved",
                action: "link",
                target: `${process.env.VITE_APP_URL}/alerts?fid=${fid}`
              }
            ]
          }
          break
          
        case 3: // Dismiss
          responseFrame = {
            version: "vNext",
            image: `${process.env.VITE_FRAME_URL}/images/dismissed.png`,
            buttons: [
              {
                label: "Back to Dashboard",
                action: "link",
                target: `${process.env.VITE_APP_URL}/dashboard?fid=${fid}`
              }
            ]
          }
          break
          
        default:
          responseFrame = {
            version: "vNext",
            image: `${process.env.VITE_FRAME_URL}/images/trend-alert.png`,
            buttons: [
              {
                label: "Read More",
                action: "link",
                target: "https://example.com/article"
              }
            ]
          }
      }

      res.status(200).json(responseFrame)
    } catch (error) {
      console.error('Error handling trend frame:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  // Handle content discovery frame
  async handleContentFrame(req, res) {
    try {
      const { fid, buttonIndex, untrustedData } = req.body
      
      const isValid = await farcasterService.verifyFrameSignature(req.body)
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid frame signature' })
      }

      let responseFrame
      
      switch (buttonIndex) {
        case 2: // Save for Later
          responseFrame = {
            version: "vNext",
            image: `${process.env.VITE_FRAME_URL}/images/content-saved.png`,
            buttons: [
              {
                label: "View Saved",
                action: "link",
                target: `${process.env.VITE_APP_URL}/content/saved?fid=${fid}`
              },
              {
                label: "More Content",
                action: "post",
                target: `${process.env.VITE_FRAME_URL}/api/content-frame`
              }
            ]
          }
          break
          
        case 3: // More Content
          // Get next content item
          const content = await apiService.getHealthContent([], 1)
          responseFrame = farcasterService.createContentFrame(content[0])
          break
          
        default:
          responseFrame = {
            version: "vNext",
            image: `${process.env.VITE_FRAME_URL}/images/content-preview.png`,
            buttons: [
              {
                label: "Read Article",
                action: "link",
                target: "https://example.com/article"
              }
            ]
          }
      }

      res.status(200).json(responseFrame)
    } catch (error) {
      console.error('Error handling content frame:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  // Handle dashboard frame
  async handleDashboardFrame(req, res) {
    try {
      const { fid, buttonIndex, untrustedData } = req.body
      
      const isValid = await farcasterService.verifyFrameSignature(req.body)
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid frame signature' })
      }

      let responseFrame
      
      switch (buttonIndex) {
        case 1: // Log Symptom
          responseFrame = farcasterService.createSymptomFrame()
          break
          
        case 2: // View Trends
          responseFrame = {
            version: "vNext",
            image: `${process.env.VITE_FRAME_URL}/images/trends.png`,
            buttons: [
              {
                label: "Open App",
                action: "link",
                target: `${process.env.VITE_APP_URL}/trends?fid=${fid}`
              },
              {
                label: "Back",
                action: "post",
                target: `${process.env.VITE_FRAME_URL}/api/dashboard`
              }
            ]
          }
          break
          
        case 3: // Browse Content
          const content = await apiService.getHealthContent([], 1)
          responseFrame = farcasterService.createContentFrame(content[0])
          break
          
        default:
          responseFrame = {
            version: "vNext",
            image: `${process.env.VITE_FRAME_URL}/images/dashboard.png`,
            buttons: [
              {
                label: "Log Symptom",
                action: "post",
                target: `${process.env.VITE_FRAME_URL}/api/symptom-frame`
              },
              {
                label: "View Trends",
                action: "post",
                target: `${process.env.VITE_FRAME_URL}/api/dashboard`
              },
              {
                label: "Browse Content",
                action: "post",
                target: `${process.env.VITE_FRAME_URL}/api/content-frame`
              }
            ]
          }
      }

      res.status(200).json(responseFrame)
    } catch (error) {
      console.error('Error handling dashboard frame:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  // Generate frame images dynamically
  async generateFrameImage(req, res) {
    try {
      const { type, data } = req.query
      
      // This would generate dynamic images based on user data
      // For now, return static image URLs
      const imageMap = {
        'symptom-log': `${process.env.VITE_FRAME_URL}/images/symptom-log.png`,
        'trend-alert': `${process.env.VITE_FRAME_URL}/images/trend-alert.png`,
        'content-preview': `${process.env.VITE_FRAME_URL}/images/content-preview.png`,
        'dashboard': `${process.env.VITE_FRAME_URL}/images/dashboard.png`,
        'success': `${process.env.VITE_FRAME_URL}/images/success.png`,
        'error': `${process.env.VITE_FRAME_URL}/images/error.png`
      }

      const imageUrl = imageMap[type] || imageMap['dashboard']
      
      // Redirect to the image
      res.redirect(imageUrl)
    } catch (error) {
      console.error('Error generating frame image:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// Frame metadata for different types
export const frameMetadata = {
  symptomLog: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${process.env.VITE_FRAME_URL}/images/symptom-log.png`,
    'fc:frame:button:1': 'Log Symptom',
    'fc:frame:button:2': 'View History',
    'fc:frame:input:text': 'Describe your symptoms...',
    'fc:frame:post_url': `${process.env.VITE_FRAME_URL}/api/symptom-frame`
  },
  
  dashboard: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${process.env.VITE_FRAME_URL}/images/dashboard.png`,
    'fc:frame:button:1': 'Log Symptom',
    'fc:frame:button:2': 'View Trends',
    'fc:frame:button:3': 'Browse Content',
    'fc:frame:post_url': `${process.env.VITE_FRAME_URL}/api/dashboard`
  },
  
  trendAlert: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${process.env.VITE_FRAME_URL}/images/trend-alert.png`,
    'fc:frame:button:1': 'Read More',
    'fc:frame:button:2': 'Save Alert',
    'fc:frame:button:3': 'Dismiss',
    'fc:frame:post_url': `${process.env.VITE_FRAME_URL}/api/trend-frame`
  },
  
  contentPreview: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${process.env.VITE_FRAME_URL}/images/content-preview.png`,
    'fc:frame:button:1': 'Read Article',
    'fc:frame:button:2': 'Save for Later',
    'fc:frame:button:3': 'More Content',
    'fc:frame:post_url': `${process.env.VITE_FRAME_URL}/api/content-frame`
  }
}
