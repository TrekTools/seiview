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
            volume_diff_1d
            volume_percent_diff_1d
            previous_volume_1d
            previous_owners_1d
            previous_floor_1d
            previous_auction_count_1d
            owners_percent_diff_1d
            owners_diff_1d
            floor_percent_diff_1d
            floor_diff_1d
            auction_count_percent_diff_1d
            auction_count_diff_1d
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
              'content-type': 'application/json',
              'x-hasura-admin-secret': process.env.VUE_APP_HASURA_ADMIN_SECRET
            }
          }
        )
        
        if (response.data.errors) {
          console.error('GraphQL Errors:', response.data.errors);
          return;
        }

        if (!response.data || !response.data.data) {
          console.error('Invalid response structure:', JSON.stringify(response.data, null, 2));
          return;
        }

        const { data } = response.data;
        if (!data.pallet_time_comparison) {
          console.error('Missing pallet_time_comparison in response:', JSON.stringify(data, null, 2));
          return;
        }
        
        this.marketData = data.pallet_time_comparison;
        this.filteredData = this.marketData;
        this.createTreemap();
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response) {
          console.error('Error response data:', err.response.data);
        }
      }
    },

    createTreemap() {
      const dataToShow = this.filteredData.length > 0 ? this.filteredData : this.marketData;
      
      const data = [{
        type: 'treemap',
        labels: dataToShow.map(item => {
          const floorText = `Floor: ${this.formatNumber(item.previous_floor_1d)}`;
          const floorDiff = `(${this.formatPercent(item.floor_percent_diff_1d)})`;
          const volumeText = `Volume: ${this.formatNumber(item.previous_volume_1d)}`;
          const volumeDiff = `(${this.formatPercent(item.volume_percent_diff_1d)})`;
          return `${item.name}<br>${floorText} ${floorDiff}<br>${volumeText} ${volumeDiff}`;
        }),
        hovertext: dataToShow.map(item => {
          const floorText = `Floor: ${this.formatNumber(item.previous_floor_1d)}`;
          const floorDiff = `(${this.formatPercent(item.floor_percent_diff_1d)})`;
          const volumeText = `Volume: ${this.formatNumber(item.previous_volume_1d)}`;
          const volumeDiff = `(${this.formatPercent(item.volume_percent_diff_1d)})`;
          return `<b>${item.name}</b><br><br>${floorText} ${floorDiff}<br>${volumeText} ${volumeDiff}`;
        }),
        parents: dataToShow.map(() => ''),
        values: dataToShow.map(item => item.previous_volume_1d),
        textposition: 'middle center',
        hoverinfo: 'text',
        hoverlabel: {
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          bordercolor: 'var(--lcars-orange)',
          font: {
            family: 'Antonio',
            size: 24,
            color: 'white'
          },
          align: 'left'
        },
        textfont: {
          family: 'Antonio',
          color: 'white'
        },
        textinfo: 'label',
        marker: {
          colors: dataToShow.map(item => {
            const percentChange = item.floor_percent_diff_1d;
            if (percentChange >= 1) return 'rgba(46, 196, 182, 0.4)';
            if (percentChange <= -1) return 'rgba(231, 29, 54, 0.4)';
            return 'rgba(212, 180, 131, 0.4)';
          }),
          line: {
            width: 2,
            color: 'var(--lcars-orange)'
          }
        }
      }]

      const layout = {
        paper_bgcolor: 'black',
        plot_bgcolor: 'black',
        margin: { t: 0, l: 0, r: 0, b: 0 },
        hoverlabel: {
          namelength: -1  // Show full text in hover label
        }
      }

      const config = {
        responsive: true,
        displayModeBar: false
      }

      Plotly.newPlot('treemap', data, layout, config)

      // Add event listener for the plot render
      const treemapDiv = document.getElementById('treemap');
      treemapDiv.on('plotly_afterplot', () => {
        const textElements = treemapDiv.getElementsByClassName('textspan');
        
        Array.from(textElements).forEach(text => {
          const parentTile = text.closest('g.trace');
          if (parentTile) {
            const rect = parentTile.getElementsByTagName('rect')[0];
            if (rect) {
              const width = parseFloat(rect.getAttribute('width'));
              const height = parseFloat(rect.getAttribute('height'));
              const area = width * height;
              
              // Scale font size based on tile area
              const minSize = 20;  // Minimum font size
              const maxSize = 400; // Maximum font size
              const scaleFactor = 0.00015; // Adjust this to change scaling sensitivity
              
              const fontSize = Math.min(
                maxSize,
                Math.max(minSize, Math.sqrt(area) * scaleFactor)
              );
              
              // Hide text if tile is too small
              if (fontSize <= minSize) {
                text.style.display = 'none';
              } else {
                text.style.display = '';
                text.style.fontSize = `${fontSize}px`;
              }
            }
          }
        });
      });
    },

    formatNumber(value) {
      return new Intl.NumberFormat().format(value || 0)
    },

    formatPercent(value) {
      return `${((value || 0)).toFixed(2)}%`
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
          filtered = filtered.filter(item => (item.floor_percent_diff_1d) >= 1);
          break;
        case 'losers':
          filtered = filtered.filter(item => (item.floor_percent_diff_1d) <= -1);
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