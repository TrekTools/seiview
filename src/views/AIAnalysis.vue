<template>
  <div class="ai-container">
    <div class="lcars-header-bar">
      <div class="title">AI Market Analysis</div>
    </div>

    <div class="query-section">
      <div class="input-container">
        <input 
          v-model="userQuestion" 
          @keyup.enter="askAI"
          placeholder="Ask about Sei NFT market trends..."
          :disabled="loading"
        />
        <button 
          @click="askAI" 
          :disabled="loading || !userQuestion"
          class="lcars-button"
        >
          {{ loading ? 'Thinking...' : 'Ask AI' }}
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="aiResponse" class="response-container">
        <div class="response-content">
          {{ aiResponse }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AIAnalysis',
  data() {
    return {
      userQuestion: '',
      aiResponse: '',
      loading: false,
      error: '',
      marketData: null
    }
  },
  methods: {
    async fetchMarketData() {
      const query = `
        query GetMarketData {
            pallet_timeseries {
                name
                rounded_time
                floor
                auction_count
                volume
                owners
            }
        }
      `

      try {
        const response = await axios.post(
          'https://select-oyster-59.hasura.app/v1/graphql',
          { query },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': process.env.VUE_APP_HASURA_ADMIN_SECRET
            }
          }
        )
        this.marketData = response.data.data.market_data
      } catch (err) {
        console.error('Error fetching market data:', err)
        this.error = 'Failed to fetch market data'
      }
    },

    async askAI() {
      if (!this.userQuestion || this.loading) return

      this.loading = true
      this.error = ''
      
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are a helpful NFT market analyst. You have access to the following Sei Network NFT market data: ${JSON.stringify(this.marketData)}`
              },
              {
                role: "user",
                content: this.userQuestion
              }
            ],
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.VUE_APP_OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        )

        this.aiResponse = response.data.choices[0].message.content
      } catch (err) {
        console.error('Error getting AI response:', err)
        
        // Handle quota exceeded specifically
        if (err.response?.data?.error?.code === 'insufficient_quota') {
          this.error = 'AI service is currently unavailable. Please try again later.'
        } else {
          this.error = 'Failed to get AI response. Please try again.'
        }
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.fetchMarketData()
  }
}
</script>

<style scoped>
.ai-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.lcars-header-bar {
  background-color: var(--lcars-orange);
  height: 40px;
  border-radius: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.title {
  color: black;
  font-size: 1.5em;
  font-weight: 600;
}

.query-section {
  background-color: var(--lcars-background);
  padding: 20px;
  border-radius: 10px;
}

.input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--lcars-orange);
  border-radius: 5px;
  background-color: var(--lcars-background-dark);
  color: var(--lcars-text);
}

.lcars-button {
  padding: 10px 20px;
  background-color: var(--lcars-orange);
  border: none;
  border-radius: 5px;
  color: black;
  cursor: pointer;
  transition: opacity 0.3s;
}

.lcars-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  margin-bottom: 15px;
}

.response-container {
  background-color: var(--lcars-background-dark);
  padding: 20px;
  border-radius: 5px;
  border-left: 4px solid var(--lcars-orange);
}

.response-content {
  color: var(--lcars-text);
  line-height: 1.6;
  white-space: pre-wrap;
}
</style> 