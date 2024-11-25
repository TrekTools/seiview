<template>
  <div class="time-series">
    <div class="lcars-header-bar">
      <div class="title">TIME SERIES ANALYSIS (24 Hours)</div>
    </div>
    
    <!-- Controls container -->
    <div class="controls-container">
      <!-- Search input -->
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          @input="filterData"
          placeholder="Search collections..."
          class="search-input"
        />
      </div>

      <!-- Metric selector -->
      <div class="metric-selector">
        <select v-model="selectedMetric" class="metric-select">
          <option value="floor">Floor Price</option>
          <option value="volume">Volume</option>
          <option value="owners">Owners</option>
          <option value="auction_count">Auctions</option>
        </select>
      </div>

      <div class="multiplier-toggle" v-if="selectedMetric === 'floor'">
        <label class="toggle-label">
          <input 
            type="checkbox" 
            v-model="multiplyFloor"
            class="toggle-input"
          >
          2x Floor Price
        </label>
      </div>
    </div>

    <!-- Chart -->
    <div class="chart-container" v-if="chartData">
      <Line
        :data="chartData"
        :options="chartOptions"
        :key="multiplyFloor"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'TimeSeriesAnalysis',
  components: { 
    Line
  },
  data() {
    return {
      loading: false,
      error: null,
      maxRecord: null,
      localTimeSeriesData: [],
      filteredTimeSeriesData: [],
      searchQuery: '',
      selectedMetric: 'floor',  // Default to floor
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        color: 'white',
        scales: {
          x: {
            ticks: { 
              color: 'white',
              font: {
                family: 'Antonio',
                size: 12
              }
            },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { 
              color: 'white',
              font: {
                family: 'Antonio',
                size: 18
              }
            },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        },
        plugins: {
          tooltip: {
            titleFont: {
              family: 'Antonio'
            },
            bodyFont: {
              family: 'Antonio'
            },
            callbacks: {
              label: function(context) {
                const metricLabels = {
                  floor: 'Floor Price',
                  volume: 'Volume',
                  owners: 'Owners',
                  auction_count: 'Auctions'
                };
                return `${context.dataset.label}: ${metricLabels[this.selectedMetric]} ${context.parsed.y}`;
              }.bind(this)
            }
          },
          legend: {
            labels: {
              color: 'white',
              font: {
                family: 'Antonio'
              }
            }
          }
        }
      },
      multiplyFloor: false,
    }
  },
  watch: {
    filteredTimeSeriesData: {
      handler(newData) {
        this.updateChartData(newData)
      },
      deep: true
    },
    selectedMetric() {
      this.updateChartData(this.filteredTimeSeriesData)
    },
    multiplyFloor() {
      this.updateChartData(this.filteredTimeSeriesData)
    }
  },
  created() {
    this.fetchMaxRecord()
  },
  methods: {
    async fetchMaxRecord() {
      const query = `
        query recorder {
          max_record {
            current_max
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
        
        this.maxRecord = response.data.data.max_record[0].current_max
        this.fetchTimeSeriesData(this.maxRecord - 24)
      } catch (err) {
        console.error('Error fetching max record:', err)
        this.error = err.message
      }
    },
    async fetchTimeSeriesData(minRecord) {
      const query = `
        query pallet_time_analysis($minRecord: Int!) {
          pallet_timeseries(where: { record: { _gte: $minRecord } }) {
            name
            record
            rounded_time
            floor
            volume
            owners
            auction_count
          }
          token_timeseries(
            where: {
              name: {_eq: "Wrapped SEI"},
              record: { _gte: $minRecord }
            }
          ) {
            record
            usd_price
          }
        }
      `

      try {
        this.loading = true
        const response = await axios.post(
          'https://select-oyster-59.hasura.app/v1/graphql',
          { 
            query,
            variables: {
              minRecord: minRecord
            }
          },
          {
            headers: {
              'content-type': 'application/json',
              'x-hasura-admin-secret': process.env.VUE_APP_HASURA_ADMIN_SECRET
            }
          }
        )
        
        // Create a map of record to USD price
        const usdPrices = new Map(
          response.data.data.token_timeseries.map(item => [item.record, item.usd_price])
        )

        // Attach USD price to each timeseries entry
        this.localTimeSeriesData = response.data.data.pallet_timeseries.map(item => ({
          ...item,
          usd_price: usdPrices.get(item.record) || 0
        }))
        this.filteredTimeSeriesData = this.localTimeSeriesData
      } catch (err) {
        console.error('Error fetching time series data:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    filterData() {
      // Check if the search query is wrapped in quotes
      const isExactMatch = this.searchQuery.startsWith('"') && this.searchQuery.endsWith('"');
      
      if (isExactMatch) {
        // Remove the quotes and do exact matching
        const exactQuery = this.searchQuery.slice(1, -1);
        this.filteredTimeSeriesData = this.localTimeSeriesData.filter(item => 
          item.name === exactQuery
        );
      } else {
        // Regular partial matching
        const queryWords = this.searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        this.filteredTimeSeriesData = this.localTimeSeriesData.filter(item => {
          const itemString = Object.values(item).join(' ').toLowerCase();
          return queryWords.every(word => itemString.includes(word));
        });
      }
    },
    updateChartData(data) {
      // Group data by collection name
      const collections = {}
      data.forEach(item => {
        if (!collections[item.name]) {
          collections[item.name] = {
            times: [],
            values: []
          }
        }
        collections[item.name].times.push(item.rounded_time)
        let value = item[this.selectedMetric]
        if (this.selectedMetric === 'floor' && this.multiplyFloor) {
          value *= (item.usd_price || 0)  // Multiply by actual USD price
        }
        collections[item.name].values.push(value)
      })

      // Create chart data
      this.chartData = {
        labels: [...new Set(data.map(item => item.rounded_time))].sort(),
        datasets: Object.entries(collections).map(([name, data]) => ({
          label: name,
          data: data.values,
          borderColor: this.getRandomColor(),
          tension: 0.1
        }))
      }

      // Update chart options
      this.chartOptions = {
        ...this.chartOptions,
        scales: {
          ...this.chartOptions.scales,
          y: {
            ...this.chartOptions.scales.y,
            title: {
              display: true,
              text: this.selectedMetric === 'floor' ? (this.multiplyFloor ? '$USD' : '$SEI') : '',
              color: 'white',
              font: {
                family: 'Antonio',
                size: 18
              }
            },
            ticks: {
              color: 'white',
              font: {
                family: 'Antonio',
                size: 18
              }
            }
          }
        }
      }
    },
    getRandomColor() {
      const colors = [
        '#FF9F1C',  // Orange
        '#2EC4B6',  // Teal
        '#E71D36',  // Red
        '#FF3366',  // Pink
        '#7209B7',  // Purple
        '#4CC9F0'   // Blue
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }
  }
}
</script>

<style scoped>
.time-series {
  padding: 20px;
  background-color: black;
  color: white;
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

.controls-container {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.search-container {
  flex: 1;
}

.metric-selector {
  width: 200px;
}

.metric-select {
  width: 100%;
  padding: 10px;
  background-color: var(--lcars-orange);
  border: none;
  border-radius: 10px;
  color: black;
  font-family: var(--lcars-font);
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
}

.metric-select:hover {
  background-color: #FFA500;
}

.metric-select option {
  background-color: black;
  color: white;
  padding: 10px;
}

.search-input {
  width: 100%;
  padding: 10px;
  background-color: black;
  border: 1px solid var(--lcars-blue);
  border-radius: 10px;
  color: white;
  font-family: var(--lcars-font);
  font-size: 1em;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.chart-container {
  height: 70vh;
  margin: 20px 0;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
}

.multiplier-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-family: var(--lcars-font);
  cursor: pointer;
}

.toggle-input {
  width: 18px;
  height: 18px;
  accent-color: var(--lcars-orange);
}
</style> 