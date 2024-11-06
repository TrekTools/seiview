<template>
  <div class="market-analysis">
    <div class="lcars-header-bar">
      <div class="title">VOLUME VIEW (24 Hours)</div>
    </div>
    
    <div class="controls-container">
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          @input="filterAndUpdateTreemap"
          placeholder="Search collections..."
          class="search-input"
        />
      </div>

      <div class="filter-buttons">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          @click="setFilter(filter.value)"
          :class="['filter-button', { active: currentFilter === filter.value }]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>
    
    <div id="treemap" class="treemap-container"></div>
  </div>
</template>

<script>
import axios from 'axios'
import Plotly from 'plotly.js-dist'

export default {
  name: 'MarketAnalysis',
  components: {
    // Remove this line if it exists:
    // BetaDisclaimer
  },
  data() {
    return {
      marketData: [],
      searchQuery: '',
      filteredData: [],
      currentFilter: 'all',
      filters: [
        { label: 'All', value: 'all' },
        { label: 'Winners', value: 'winners' },
        { label: 'Losers', value: 'losers' }
      ]
    }
  },
  mounted() {
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
        
        this.marketData = response.data.data.pallet_time_comparison
        this.filteredData = this.marketData
        this.createTreemap()
      } catch (err) {
        console.error('Fetch error:', err)
      }
    },

    createTreemap() {
      const dataToShow = this.filteredData.length > 0 ? this.filteredData : this.marketData;
      
      const data = [{
        type: 'treemap',
        labels: dataToShow.map(item => {
          const floorText = `Floor: ${this.formatNumber(item.current_floor_1h)}`;
          const floorDiff = `(${this.formatPercent(item.floor_percent_diff_1h)})`;
          const volumeText = `Volume: ${this.formatNumber(item.current_volume_1h)}`;
          const volumeDiff = `(${this.formatPercent(item.volume_percent_diff_1h)})`;
          return `${item.name}<br>${floorText} ${floorDiff}<br>${volumeText} ${volumeDiff}`;
        }),
        parents: dataToShow.map(() => ''),
        values: dataToShow.map(item => item.current_volume_1h),
        textposition: 'middle center',
        hoverinfo: 'none',
        marker: {
          colors: dataToShow.map(item => {
            const percentChange = item.floor_percent_diff_1h * 100;
            if (percentChange >= 1) return 'rgba(46, 196, 182, 0.4)';
            if (percentChange <= -1) return 'rgba(231, 29, 54, 0.4)';
            return 'rgba(212, 180, 131, 0.4)';
          }),
          line: {
            width: 2,
            color: 'var(--lcars-orange)'
          }
        },
        textfont: {
          family: 'Antonio',
          size: 14,
          color: 'white'
        }
      }]

      const layout = {
        paper_bgcolor: 'black',
        plot_bgcolor: 'black',
        margin: { t: 0, l: 0, r: 0, b: 0 },
        font: {
          family: 'Antonio',
          color: 'white'
        }
      }

      const config = {
        responsive: true,
        displayModeBar: false
      }

      Plotly.newPlot('treemap', data, layout, config)
    },

    formatNumber(value) {
      return new Intl.NumberFormat().format(value || 0)
    },

    formatPercent(value) {
      return `${((value || 0) * 100).toFixed(2)}%`
    },

    setFilter(filter) {
      this.currentFilter = filter;
      this.filterAndUpdateTreemap();
    },

    filterAndUpdateTreemap() {
      let filtered = this.marketData;
      
      if (this.searchQuery) {
        const queryWords = this.searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        filtered = filtered.filter(item => {
          const itemString = item.name.toLowerCase();
          return queryWords.every(word => itemString.includes(word));
        });
      }

      switch (this.currentFilter) {
        case 'winners':
          filtered = filtered.filter(item => (item.floor_percent_diff_1h * 100) >= 1);
          break;
        case 'losers':
          filtered = filtered.filter(item => (item.floor_percent_diff_1h * 100) <= -1);
          break;
        // 'all' case doesn't need additional filtering
      }

      this.filteredData = filtered;
      this.createTreemap();
    }
  }
}
</script>

<style scoped>
.market-analysis {
  padding: 20px;
  background-color: black;
  min-height: 100vh;
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
  font-family: var(--lcars-font);
}

.treemap-container {
  height: calc(100vh - 100px);
  width: 100%;
}

:global(.textspan) {
  font-family: 'Antonio' !important;
  color: white !important;
}

.controls-container {
  margin: 20px 0;
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-container {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 10px;
  background-color: var(--lcars-background);
  border: 1px solid var(--lcars-blue);
  border-radius: 10px;
  color: var(--lcars-orange);
  font-family: var(--lcars-font);
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.filter-button {
  padding: 8px 16px;
  border: 2px solid var(--lcars-orange);
  background-color: transparent;
  color: var(--lcars-orange);
  border-radius: 10px;
  cursor: pointer;
  font-family: var(--lcars-font);
  transition: all 0.3s ease;
}

.filter-button:hover {
  background-color: var(--lcars-orange);
  color: black;
}

.filter-button.active {
  background-color: var(--lcars-orange);
  color: black;
}
</style> 