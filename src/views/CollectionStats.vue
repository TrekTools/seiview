<template>
  <div class="collection-stats">
    <BetaDisclaimer />
    <div class="lcars-header-bar">
      <div class="title">{{ collectionName }}</div>
    </div>
    
    <div class="stats-container" v-if="collectionData">
      <!-- Stats content will go here -->
      <pre>{{ collectionData }}</pre>
    </div>
    
    <div v-else-if="loading" class="loading">
      Loading...
    </div>
    
    <div v-else class="error">
      Unable to load collection data
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import BetaDisclaimer from '@/components/BetaDisclaimer.vue'

export default {
  name: 'CollectionStats',
  components: {
    BetaDisclaimer
  },
  props: {
    slug: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      collectionData: null
    }
  },
  computed: {
    collectionName() {
      return this.collectionData?.name || this.slug
    }
  },
  created() {
    console.log('CollectionStats created with slug:', this.slug)
    this.fetchCollectionData()
  },
  mounted() {
    console.log('BetaDisclaimer component:', this.$options.components.BetaDisclaimer)
  },
  methods: {
    async fetchCollectionData() {
      const query = `
        query collection_stats($slug: String!) {
          pallet_time_comparison(where: {slug: {_eq: $slug}}) {
            slug
            name
            volume_diff_1h
            volume_percent_diff_1h
            previous_volume_1h
            previous_owners_1h
            previous_floor_1h
            previous_auction_count_1h
            owners_percent_diff_1h
            owners_diff_1h
            floor_percent_diff_1h
            floor_diff_1h
            current_volume_1h
            current_owners_1h
            current_floor_1h
            current_auction_count_1h
            auction_count_percent_diff_1h
            auction_count_diff_1h
            key_data_mapping {
              pfp
              discord
              twitter
              website
            }
          }
        }
      `

      try {
        const response = await axios.post(
          'https://select-oyster-59.hasura.app/v1/graphql',
          { 
            query,
            variables: {
              slug: this.slug
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': process.env.VUE_APP_HASURA_ADMIN_SECRET
            }
          }
        )
        
        this.collectionData = response.data.data.pallet_time_comparison[0]
      } catch (err) {
        console.error('Error fetching collection data:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.collection-stats {
  padding: 20px;
  background-color: black;
  min-height: 100vh;
  position: relative;
}

.test-beta {
  color: white;
  margin-bottom: 20px;
}

.lcars-header-bar {
  background-color: var(--lcars-orange);
  height: 40px;
  border-radius: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  color: black;
  font-size: 1.5em;
  font-weight: 600;
  letter-spacing: 2px;
}

.stats-container {
  color: var(--lcars-orange);
}

.loading, .error {
  color: var(--lcars-orange);
  text-align: center;
  padding: 20px;
}
</style> 