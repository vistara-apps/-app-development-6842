import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
})

export const openaiService = {
  // Analyze symptom patterns
  async analyzeSymptomPatterns(symptoms, userConditions) {
    try {
      const prompt = `
        As a health data analyst, analyze the following symptom logs for patterns and insights.
        User conditions: ${userConditions.join(', ')}
        
        Symptom logs:
        ${symptoms.map(log => `
          Date: ${log.timestamp}
          Symptoms: ${log.symptoms.join(', ')}
          Triggers: ${log.triggers.join(', ')}
          Treatment Response: ${log.treatmentResponses}
          Notes: ${log.notes}
        `).join('\n')}
        
        Please provide:
        1. Common triggers identified
        2. Symptom frequency analysis
        3. Treatment effectiveness patterns
        4. Actionable recommendations
        
        Format the response as JSON with the following structure:
        {
          "commonTriggers": ["trigger1", "trigger2"],
          "symptomFrequency": {"symptom": count},
          "treatmentEffectiveness": {"treatment": "effectiveness_rating"},
          "recommendations": ["recommendation1", "recommendation2"],
          "insights": "Overall insights paragraph"
        }
      `

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful health data analyst. Provide insights based on symptom patterns while being careful not to provide medical advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const analysis = JSON.parse(response.choices[0].message.content)
      return analysis
    } catch (error) {
      console.error('Error analyzing symptom patterns:', error)
      throw error
    }
  },

  // Generate health trend alerts
  async generateHealthTrendAlert(researchData, userConditions) {
    try {
      const prompt = `
        Based on the following research data and user's health conditions, create a personalized health trend alert.
        
        User conditions: ${userConditions.join(', ')}
        Research data: ${researchData}
        
        Create a health alert with:
        1. Relevant title
        2. Summary (2-3 sentences)
        3. Relevance score (0-1)
        4. Key takeaways
        
        Format as JSON:
        {
          "title": "Alert title",
          "summary": "Brief summary",
          "relevanceScore": 0.95,
          "keyTakeaways": ["takeaway1", "takeaway2"],
          "actionItems": ["action1", "action2"]
        }
      `

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a health information specialist. Create relevant, actionable health alerts based on research data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      })

      const alert = JSON.parse(response.choices[0].message.content)
      return alert
    } catch (error) {
      console.error('Error generating health trend alert:', error)
      throw error
    }
  },

  // Summarize health content
  async summarizeHealthContent(contentText, userConditions) {
    try {
      const prompt = `
        Summarize the following health content for someone with these conditions: ${userConditions.join(', ')}
        
        Content: ${contentText}
        
        Provide:
        1. Key points (3-5 bullet points)
        2. Relevance to user's conditions
        3. Actionable insights
        
        Format as JSON:
        {
          "keyPoints": ["point1", "point2"],
          "relevanceToConditions": "How this relates to user's conditions",
          "actionableInsights": ["insight1", "insight2"],
          "summary": "Brief 2-sentence summary"
        }
      `

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a health content summarizer. Create concise, relevant summaries for users with specific health conditions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      })

      const summary = JSON.parse(response.choices[0].message.content)
      return summary
    } catch (error) {
      console.error('Error summarizing health content:', error)
      throw error
    }
  },

  // Generate personalized health tips
  async generatePersonalizedTips(userProfile, recentSymptoms) {
    try {
      const prompt = `
        Generate personalized health tips for a user with the following profile:
        
        Conditions: ${userProfile.selectedConditions.join(', ')}
        Recent symptoms: ${recentSymptoms.map(s => s.symptoms.join(', ')).join('; ')}
        
        Provide 3-5 actionable, evidence-based tips that are:
        1. Specific to their conditions
        2. Relevant to recent symptoms
        3. Safe and general wellness focused
        
        Format as JSON:
        {
          "tips": [
            {
              "title": "Tip title",
              "description": "Detailed description",
              "category": "diet|exercise|lifestyle|monitoring"
            }
          ]
        }
      `

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a wellness advisor. Provide safe, general health tips. Do not provide medical advice or diagnose conditions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      })

      const tips = JSON.parse(response.choices[0].message.content)
      return tips
    } catch (error) {
      console.error('Error generating personalized tips:', error)
      throw error
    }
  }
}
