<template>
  <div class="lcars-table-container">
    <!-- Orange header bar -->
    <div class="lcars-header-bar">
      <div class="title">NFT Collections</div>
    </div>
    
    <!-- Search input -->
    <div class="search-container">
      <input 
        v-model="searchQuery" 
        @input="filterData"
        placeholder="Search collections..."
        class="search-input"
      />
    </div>

    <!-- Table -->
    <div class="lcars-table">
      <!-- Headers -->
      <div class="lcars-table-headers">
        <div class="header-cell-pfp">
          PFP
        </div>
        <div class="header-cell" @click="sort('name')">
          Collection
          <span class="sort-indicator">{{ getSortIndicator('name') }}</span>
        </div>
        <div class="header-cell" @click="sort('current_floor_1h')">
          Floor
          <span class="sort-indicator">{{ getSortIndicator('current_floor_1h') }}</span>
        </div>
        <div class="header-cell" @click="sort('current_volume_1h')">
          Volume
          <span class="sort-indicator">{{ getSortIndicator('current_volume_1h') }}</span>
        </div>
        <div class="header-cell" @click="sort('current_owners_1h')">
          Owners
          <span class="sort-indicator">{{ getSortIndicator('current_owners_1h') }}</span>
        </div>
        <div class="header-cell" @click="sort('current_auction_count_1h')">
          Auctions
          <span class="sort-indicator">{{ getSortIndicator('current_auction_count_1h') }}</span>
        </div>
      </div>

      <!-- Data Rows -->
      <div class="lcars-table-rows" v-if="sortedData.length">
        <div 
          v-for="(item, index) in sortedData" 
          :key="`${item.slug}-${index}`"
          class="table-row"
          @click="handleRowClick(item)"
        >
          <div class="cell-pfp">
            <img 
              v-if="item.key_data_mapping?.pfp" 
              :src="item.key_data_mapping.pfp" 
              :alt="item.name"
              class="pfp-image"
            />
            <div v-else class="pfp-placeholder"></div>
          </div>
          <div class="cell collection">
            {{ item.name }}
            <div class="collection-links" v-if="item.key_data_mapping">
              <a v-if="item.key_data_mapping.discord" :href="item.key_data_mapping.discord" target="_blank" class="social-link">Discord</a>
              <a v-if="item.key_data_mapping.twitter" :href="item.key_data_mapping.twitter" target="_blank" class="social-link">Twitter</a>
              <a v-if="item.key_data_mapping.website" :href="item.key_data_mapping.website" target="_blank" class="social-link">Website</a>
            </div>
          </div>
          <div class="cell">
            <div class="value">{{ formatNumber(item.current_floor_1h) }}</div>
            <div class="diff" :class="getDiffClass(item.floor_percent_diff_1h)">
              {{ formatPercent(item.floor_percent_diff_1h) }}
            </div>
          </div>
          <div class="cell">
            <div class="value">{{ formatNumber(item.current_volume_1h) }}</div>
            <div class="diff" :class="getDiffClass(item.volume_percent_diff_1h)">
              {{ formatPercent(item.volume_percent_diff_1h) }}
            </div>
          </div>
          <div class="cell">
            <div class="value">{{ formatNumber(item.current_owners_1h) }}</div>
            <div class="diff" :class="getDiffClass(item.owners_percent_diff_1h)">
              {{ formatPercent(item.owners_percent_diff_1h) }}
            </div>
          </div>
          <div class="cell">
            <div class="value">{{ formatNumber(item.current_auction_count_1h) }}</div>
            <div class="diff" :class="getDiffClass(item.auction_count_percent_diff_1h)">
              {{ formatPercent(item.auction_count_percent_diff_1h) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MarketTable',
  data() {
    return {
      loading: false,
      error: null,
      localMarketData: [],
      filteredMarketData: [],
      searchQuery: '',
      sortKey: 'current_volume_1h',
      sortOrder: 'desc'
    }
  },
  computed: {
    sortedData() {
      return [...this.filteredMarketData].sort((a, b) => {
        let aValue = a[this.sortKey];
        let bValue = b[this.sortKey];
        
        // Handle string comparison for name
        if (this.sortKey === 'name') {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        } else {
          // Handle numeric values
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }
        
        if (this.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
  },
  created() {
    this.fetchMarketData()
  },
  methods: {
    async fetchMarketData() {
      const query = `
        query seiview_market {
          pallet_time_comparison {
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
        this.loading = true
        const response = await axios.post(
          'https://select-oyster-59.hasura.app/v1/graphql',
          { query },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': import.meta.env.VITE_HASURA_ADMIN_SECRET
            }
          }
        )
        
        // Transform the data to include name (using slug for now)
        this.localMarketData = response.data.data.pallet_time_comparison.map(item => ({
          ...item,
          name: item.name // Replace this with actual name if available
        }));
        
        this.filteredMarketData = this.localMarketData
      } catch (err) {
        console.error('Fetch error:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    filterData() {
      const queryWords = this.searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0);
      
      this.filteredMarketData = this.localMarketData.filter(item => {
        const itemString = Object.values(item).join(' ').toLowerCase();
        return queryWords.every(word => itemString.includes(word));
      });
    },
    formatNumber(value) {
      return new Intl.NumberFormat().format(value);
    },
    formatPercent(value) {
      return `${(value * 100).toFixed(2)}%`;
    },
    getDiffClass(value) {
      return {
        'positive': value > 0,
        'negative': value < 0,
        'neutral': value === 0
      };
    },
    sort(key) {
      if (this.sortKey === key) {
        // If clicking the same column, toggle sort order
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // If clicking a new column, set it as sort key and default to ascending
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },
    getSortIndicator(key) {
      if (this.sortKey !== key) return '⋮';
      return this.sortOrder === 'asc' ? '↑' : '↓';
    },
    formatName(slug) {
      if (!slug) return '';
      
      // Special case for specific slugs
      const specialCases = {
        'goblin': 'Goblin',
        'absence': 'Absence',
        'age-of-estates': 'Age of Estates'
      };

      // Check if we have a special case for this slug
      if (specialCases[slug]) {
        return specialCases[slug];
      }

      // Default formatting for other slugs
      return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
    handleRowClick(item) {
      window.open(`https://pallet.exchange/collection/${item.slug}`, '_blank');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Antonio:wght@100;200;300;400;500;600;700&display=swap');

.lcars-table-container {
  font-family: var(--lcars-font);
  padding: 20px;
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
  letter-spacing: 2px;  /* Optional: adds some spacing between letters */
}

.search-container {
  margin: 20px 0;
}

.search-input {
  width: 100%;
  padding: 10px;
  background-color: var(--lcars-background);
  border: 1px solid var(--lcars-blue);
  border-radius: 10px;
  color: var(--lcars-orange);
}

.lcars-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lcars-table-headers {
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  gap: 10px;
}

.header-cell-pfp {
  background-color: var(--lcars-orange);
  color: black;
  padding: 12px;
  border-radius: 15px;
  font-weight: 600;
  text-align: center;
}

.header-cell-pfp:hover {
  background-color: #FFA500;
}

.sort-indicator {
  margin-left: 8px;
  font-weight: bold;
  color: black;
}

.table-row {
  cursor: pointer;
  text-decoration: none;  /* Remove link underline */
  color: inherit;  /* Keep original text color */
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  gap: 10px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(74, 111, 158, 0.5);
  margin-bottom: 8px;
}

.table-row:hover {
  background-color: rgba(74, 111, 158, 0.1);
}

.cell-pfp {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pfp-image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
}

.pfp-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background-color: rgba(74, 111, 158, 0.2);
}

.collection {
  color: var(--lcars-pink);
  font-weight: 500;
  font-size: 1.5em;
}

.value {
  color: var(--lcars-orange);
  font-size: 1.5em;
  font-weight: 500;
}

.diff {
  padding: 2px 6px;
  border-radius: 8px;
  width: fit-content;
  font-size: 0.85em;
  opacity: 0.9;
}

.diff.positive {
  background-color: var(--lcars-blue);
  color: black;
}

.diff.negative {
  background-color: var(--lcars-red);
  color: white;
}

.diff.neutral {
  background-color: var(--lcars-brown);
  color: black;
}

.collection-links {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.social-link {
  color: var(--lcars-blue);
  text-decoration: none;
  font-size: 0.8em;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(153, 204, 255, 0.1);
}

.social-link:hover {
  background-color: var(--lcars-blue);
  color: black;
}

.cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.value {
  color: var(--lcars-orange);
  font-size: 1.5em;
  font-weight: 500;
  display: block;
}

.diff {
  padding: 2px 6px;
  border-radius: 8px;
  width: fit-content;
  font-size: 0.85em;
  opacity: 0.9;
  display: block;
}

/* Update header cell styles */
.header-cell, .header-cell-pfp {
  background-color: var(--lcars-orange);
  color: black;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  padding: 12px;
  border-radius: 15px;
  font-weight: 600;
}

.header-cell:hover, .header-cell-pfp:hover {
  background-color: #FFA500;  /* Slightly different orange on hover */
}

.sort-indicator {
  margin-left: 8px;
  font-weight: bold;
  color: black;  /* Ensuring sort indicator is also black */
}
</style> 