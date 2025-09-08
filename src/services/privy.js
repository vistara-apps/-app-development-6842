// Privy authentication and wallet integration
export const privyService = {
  // Initialize Privy configuration
  config: {
    appId: import.meta.env.VITE_PRIVY_APP_ID,
    appearance: {
      theme: 'light',
      accentColor: 'hsl(160, 80%, 45%)',
      logo: '/logo.svg'
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets'
    },
    loginMethods: ['wallet', 'email', 'sms'],
    supportedChains: [
      {
        id: 8453, // Base mainnet
        name: 'Base',
        network: 'base',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: {
          default: {
            http: ['https://mainnet.base.org']
          }
        },
        blockExplorers: {
          default: {
            name: 'BaseScan',
            url: 'https://basescan.org'
          }
        }
      }
    ]
  },

  // Handle successful authentication
  async onAuthSuccess(user, isNewUser) {
    try {
      console.log('User authenticated:', user)
      
      // Create or update user profile in Supabase
      const userData = {
        userId: user.id,
        email: user.email?.address,
        walletAddress: user.wallet?.address,
        createdAt: isNewUser ? new Date().toISOString() : undefined,
        lastLoginAt: new Date().toISOString()
      }

      // If new user, set up default health profile
      if (isNewUser) {
        userData.selectedConditions = []
        userData.subscriptionStatus = 'free'
        userData.notificationPreferences = {
          trends: true,
          patterns: true,
          subscriptions: true
        }
      }

      return userData
    } catch (error) {
      console.error('Error handling auth success:', error)
      throw error
    }
  },

  // Handle authentication error
  onAuthError(error) {
    console.error('Authentication error:', error)
    // Handle different error types
    switch (error.code) {
      case 'user_cancelled':
        return 'Authentication was cancelled'
      case 'wallet_connection_failed':
        return 'Failed to connect wallet'
      case 'network_error':
        return 'Network error occurred'
      default:
        return 'Authentication failed'
    }
  },

  // Create payment with USDC on Base
  async createUSDCPayment(amount, recipientAddress, user) {
    try {
      if (!user.wallet) {
        throw new Error('No wallet connected')
      }

      // USDC contract address on Base
      const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
      
      // Create transaction data for USDC transfer
      const transactionData = {
        to: USDC_CONTRACT,
        data: this.encodeUSDCTransfer(recipientAddress, amount),
        value: '0x0'
      }

      // Send transaction through Privy
      const txHash = await user.wallet.sendTransaction(transactionData)
      
      return {
        transactionHash: txHash,
        amount,
        currency: 'USDC',
        recipient: recipientAddress,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error creating USDC payment:', error)
      throw error
    }
  },

  // Encode USDC transfer function call
  encodeUSDCTransfer(to, amount) {
    // This is a simplified version - in production, use a proper ABI encoder
    const transferSelector = '0xa9059cbb' // transfer(address,uint256)
    const paddedTo = to.slice(2).padStart(64, '0')
    const paddedAmount = amount.toString(16).padStart(64, '0')
    
    return transferSelector + paddedTo + paddedAmount
  },

  // Get user's USDC balance
  async getUSDCBalance(walletAddress) {
    try {
      const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
      
      // This would typically use a web3 provider to call the contract
      // For now, return a mock balance
      return {
        balance: '100.00',
        currency: 'USDC',
        address: walletAddress
      }
    } catch (error) {
      console.error('Error getting USDC balance:', error)
      throw error
    }
  },

  // Handle subscription payment
  async handleSubscriptionPayment(planId, user) {
    try {
      const plans = {
        premium: {
          price: 5,
          currency: 'USDC',
          recipient: '0x...' // Your payment recipient address
        }
      }

      const plan = plans[planId]
      if (!plan) {
        throw new Error('Invalid plan')
      }

      // Create USDC payment
      const payment = await this.createUSDCPayment(
        plan.price,
        plan.recipient,
        user
      )

      // Update user subscription status
      const subscriptionData = {
        userId: user.id,
        planId,
        status: 'active',
        paymentHash: payment.transactionHash,
        startDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      return {
        payment,
        subscription: subscriptionData
      }
    } catch (error) {
      console.error('Error handling subscription payment:', error)
      throw error
    }
  },

  // Verify wallet ownership
  async verifyWalletOwnership(user, message) {
    try {
      if (!user.wallet) {
        throw new Error('No wallet connected')
      }

      const signature = await user.wallet.signMessage(message)
      
      return {
        message,
        signature,
        address: user.wallet.address,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error verifying wallet ownership:', error)
      throw error
    }
  },

  // Get user's onchain identity
  getUserOnchainIdentity(user) {
    return {
      userId: user.id,
      walletAddress: user.wallet?.address,
      email: user.email?.address,
      phone: user.phone?.number,
      linkedAccounts: user.linkedAccounts || [],
      createdAt: user.createdAt,
      isVerified: user.wallet?.verified || false
    }
  },

  // Handle logout
  async handleLogout(user) {
    try {
      // Clear local storage
      localStorage.removeItem('healthsync_user')
      localStorage.removeItem('healthsync_session')
      
      // Log logout event
      console.log('User logged out:', user.id)
      
      return true
    } catch (error) {
      console.error('Error handling logout:', error)
      throw error
    }
  },

  // Check if user has premium subscription
  async checkPremiumStatus(user) {
    try {
      // This would check the user's subscription status from your database
      // For now, return mock data
      return {
        isPremium: user.subscriptionStatus === 'premium',
        planId: user.subscriptionStatus,
        expiresAt: user.subscriptionExpiresAt,
        features: user.subscriptionStatus === 'premium' ? [
          'unlimited_symptom_logging',
          'ai_pattern_analysis',
          'personalized_alerts',
          'advanced_analytics',
          'priority_support',
          'data_export'
        ] : [
          'basic_content_access',
          'limited_symptom_logging',
          'basic_insights'
        ]
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
      throw error
    }
  }
}
