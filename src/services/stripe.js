import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const stripeService = {
  // Initialize Stripe
  async getStripe() {
    return await stripePromise
  },

  // Create subscription checkout session
  async createSubscriptionCheckout(priceId, userId, successUrl, cancelUrl) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl,
          cancelUrl,
          mode: 'subscription'
        }),
      })

      const session = await response.json()
      
      if (session.error) {
        throw new Error(session.error)
      }

      const stripe = await this.getStripe()
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error creating subscription checkout:', error)
      throw error
    }
  },

  // Create one-time payment checkout
  async createPaymentCheckout(amount, currency, userId, successUrl, cancelUrl) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          userId,
          successUrl,
          cancelUrl,
          mode: 'payment'
        }),
      })

      const session = await response.json()
      
      if (session.error) {
        throw new Error(session.error)
      }

      const stripe = await this.getStripe()
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error creating payment checkout:', error)
      throw error
    }
  },

  // Get customer subscription status
  async getSubscriptionStatus(customerId) {
    try {
      const response = await fetch(`/api/subscription-status/${customerId}`)
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      return data
    } catch (error) {
      console.error('Error getting subscription status:', error)
      throw error
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      return data
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  },

  // Update subscription
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      return data
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  },

  // Get customer portal URL
  async getCustomerPortalUrl(customerId, returnUrl) {
    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      return data.url
    } catch (error) {
      console.error('Error getting customer portal URL:', error)
      throw error
    }
  },

  // Pricing configuration
  pricing: {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      priceId: null,
      features: [
        'Basic content access',
        'Limited symptom logging (5/month)',
        'Basic health insights',
        'Community support'
      ]
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 5,
      priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
      features: [
        'Unlimited content access',
        'Unlimited symptom logging',
        'AI-powered pattern analysis',
        'Personalized health alerts',
        'Advanced analytics',
        'Priority support',
        'Export data'
      ]
    }
  }
}
