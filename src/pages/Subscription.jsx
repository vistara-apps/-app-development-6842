import React, { useState } from 'react'
import { useHealth } from '../context/HealthContext'
import { Check, Crown, Zap, Shield, Star } from 'lucide-react'

export default function Subscription() {
  const { user } = useHealth()
  const [selectedPlan, setSelectedPlan] = useState('premium')

  const features = {
    free: [
      'Basic content access',
      'Limited symptom logging (5/month)',
      'Basic health insights',
      'Community support'
    ],
    premium: [
      'Unlimited content access',
      'Unlimited symptom logging',
      'AI-powered pattern analysis',
      'Personalized health alerts',
      'Advanced analytics',
      'Priority support',
      'Export data'
    ]
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: Shield,
      description: 'Basic health tracking',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$5',
      period: 'month',
      icon: Crown,
      description: 'Full AI-powered experience',
      popular: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-dark-text">Choose Your Plan</h1>
        <p className="text-dark-textSecondary mt-2">
          Unlock the full potential of your health journey
        </p>
      </div>

      {/* Current Status */}
      <div className="card text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Crown className="w-5 h-5 text-accent" />
          <span className="font-medium text-dark-text">Current Plan: {user.subscriptionStatus}</span>
        </div>
        <p className="text-dark-textSecondary text-sm">
          {user.subscriptionStatus === 'premium' 
            ? 'You have access to all premium features'
            : 'Upgrade to premium for unlimited access'
          }
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon
          const isCurrentPlan = user.subscriptionStatus === plan.id
          
          return (
            <div
              key={plan.id}
              className={`relative card cursor-pointer transition-all duration-200 hover:scale-105 ${
                plan.popular ? 'ring-2 ring-primary' : ''
              } ${
                selectedPlan === plan.id ? 'ring-2 ring-accent' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-lg ${plan.popular ? 'bg-primary' : 'bg-accent'}`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-dark-text">{plan.name}</h3>
                <p className="text-dark-textSecondary text-sm mb-3">{plan.description}</p>
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-3xl font-bold text-dark-text">{plan.price}</span>
                  <span className="text-dark-textSecondary">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {features[plan.id].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-dark-textSecondary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                  isCurrentPlan
                    ? 'bg-dark-bg text-dark-textSecondary cursor-not-allowed'
                    : plan.popular
                    ? 'bg-primary text-white hover:bg-blue-600'
                    : 'bg-accent text-white hover:bg-green-600'
                }`}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Benefits */}
      <div className="card">
        <h2 className="text-xl font-semibold text-dark-text mb-4 text-center">
          Why Choose Premium?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium text-dark-text mb-2">AI-Powered Insights</h3>
            <p className="text-dark-textSecondary text-sm">
              Get personalized health patterns and recommendations powered by advanced AI
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-accent/10 rounded-lg w-fit mx-auto mb-3">
              <Star className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-medium text-dark-text mb-2">Unlimited Tracking</h3>
            <p className="text-dark-textSecondary text-sm">
              Log unlimited symptoms and access your complete health history
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-lg w-fit mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-medium text-dark-text mb-2">Priority Support</h3>
            <p className="text-dark-textSecondary text-sm">
              Get help when you need it with priority customer support
            </p>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      {selectedPlan === 'premium' && user.subscriptionStatus !== 'premium' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-dark-text mb-4">Payment Information</h2>
          <p className="text-dark-textSecondary mb-4">
            Secure payment processing with industry-standard encryption
          </p>
          <button className="btn-primary w-full">
            Upgrade to Premium - $5/month
          </button>
          <p className="text-xs text-dark-textSecondary text-center mt-3">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      )}
    </div>
  )
}