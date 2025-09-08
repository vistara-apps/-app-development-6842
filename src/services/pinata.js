import axios from 'axios'

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY
const PINATA_BASE_URL = 'https://api.pinata.cloud'

const pinataAxios = axios.create({
  baseURL: PINATA_BASE_URL,
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET_KEY,
  }
})

export const pinataService = {
  // Upload JSON data to IPFS
  async uploadJSON(jsonData, metadata = {}) {
    try {
      const data = {
        pinataContent: jsonData,
        pinataMetadata: {
          name: metadata.name || 'HealthSync Content',
          keyvalues: {
            type: metadata.type || 'health-content',
            timestamp: new Date().toISOString(),
            ...metadata.keyvalues
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      }

      const response = await pinataAxios.post('/pinning/pinJSONToIPFS', data)
      return {
        hash: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        timestamp: response.data.Timestamp
      }
    } catch (error) {
      console.error('Error uploading JSON to Pinata:', error)
      throw error
    }
  },

  // Upload file to IPFS
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const pinataMetadata = JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || 'health-file',
          timestamp: new Date().toISOString(),
          ...metadata.keyvalues
        }
      })
      formData.append('pinataMetadata', pinataMetadata)

      const pinataOptions = JSON.stringify({
        cidVersion: 1
      })
      formData.append('pinataOptions', pinataOptions)

      const response = await pinataAxios.post('/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return {
        hash: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        timestamp: response.data.Timestamp
      }
    } catch (error) {
      console.error('Error uploading file to Pinata:', error)
      throw error
    }
  },

  // Get pinned content list
  async getPinnedContent(filters = {}) {
    try {
      const params = {
        status: 'pinned',
        pageLimit: filters.limit || 50,
        pageOffset: filters.offset || 0
      }

      if (filters.metadata) {
        params.metadata = filters.metadata
      }

      const response = await pinataAxios.get('/data/pinList', { params })
      return response.data.rows.map(item => ({
        hash: item.ipfs_pin_hash,
        url: `https://gateway.pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
        name: item.metadata?.name,
        timestamp: item.date_pinned,
        size: item.size,
        metadata: item.metadata
      }))
    } catch (error) {
      console.error('Error getting pinned content:', error)
      throw error
    }
  },

  // Unpin content from IPFS
  async unpinContent(hash) {
    try {
      await pinataAxios.delete(`/pinning/unpin/${hash}`)
      return true
    } catch (error) {
      console.error('Error unpinning content:', error)
      throw error
    }
  },

  // Get content from IPFS
  async getContent(hash) {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`)
      return response.data
    } catch (error) {
      console.error('Error getting content from IPFS:', error)
      throw error
    }
  },

  // Upload health content with proper metadata
  async uploadHealthContent(content) {
    const metadata = {
      name: content.title,
      type: 'health-content',
      keyvalues: {
        contentType: content.type,
        conditions: content.relevantConditions.join(','),
        category: content.category || 'general'
      }
    }

    return await this.uploadJSON(content, metadata)
  },

  // Upload symptom data for backup
  async uploadSymptomData(symptoms, userId) {
    const metadata = {
      name: `Symptom Data - ${userId}`,
      type: 'symptom-backup',
      keyvalues: {
        userId: userId,
        count: symptoms.length.toString(),
        dateRange: `${symptoms[symptoms.length - 1]?.timestamp} to ${symptoms[0]?.timestamp}`
      }
    }

    return await this.uploadJSON(symptoms, metadata)
  },

  // Upload user health profile
  async uploadHealthProfile(profile) {
    const metadata = {
      name: `Health Profile - ${profile.userId}`,
      type: 'health-profile',
      keyvalues: {
        userId: profile.userId,
        conditions: profile.selectedConditions.join(',')
      }
    }

    return await this.uploadJSON(profile, metadata)
  }
}
