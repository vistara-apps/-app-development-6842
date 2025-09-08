import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database operations
export const supabaseService = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('userId', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('userId', userId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Symptom log operations
  async createSymptomLog(logData) {
    const { data, error } = await supabase
      .from('symptom_logs')
      .insert([logData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getSymptomLogs(userId, limit = 50) {
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('userId', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Health trend alerts operations
  async createHealthTrendAlert(alertData) {
    const { data, error } = await supabase
      .from('health_trend_alerts')
      .insert([alertData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getHealthTrendAlerts(userId, limit = 20) {
    const { data, error } = await supabase
      .from('health_trend_alerts')
      .select('*')
      .eq('userId', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Content operations
  async getContent(conditions = [], limit = 50) {
    let query = supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (conditions.length > 0) {
      query = query.contains('relevantConditions', conditions)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async createContent(contentData) {
    const { data, error } = await supabase
      .from('content')
      .insert([contentData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Conditions operations
  async getConditions() {
    const { data, error } = await supabase
      .from('conditions')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  }
}
