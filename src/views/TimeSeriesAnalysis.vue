<template>
  <div class="time-series">
    <div class="lcars-header-bar">
      <div class="title">TIME SERIES ANALYSIS</div>
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

      <div class="time-range-selector">
        <select v-model="selectedTimeRange" class="metric-select">
          <option value="24">Last Day</option>
          <option value="168">Last Week</option>
        </select>
      </div>

      <div class="multiplier-toggle" v-if="selectedMetric === 'floor'">
        <label class="switch-label">
          <span class="switch-text">Real Price ($USD)</span>
          <div class="switch">
            <input 
              type="checkbox" 
              v-model="multiplyFloor"
              class="switch-input"
            >
            <span class="switch-slider"></span>
          </div>
        </label>
      </div>

      <div class="trendline-toggle">
        <label class="switch-label">
          <span class="switch-text">Show Trendline</span>
          <div class="switch">
            <input 
              type="checkbox" 
              v-model="showTrendline"
              class="switch-input"
            >
            <span class="switch-slider"></span>
          </div>
        </label>
      </div>
    </div>

    <!-- Chart -->
    <div class="chart-container" v-if="chartData">
      <Line
        ref="chart"
        :data="chartData"
        :options="chartOptions"
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
import 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  require('chartjs-plugin-zoom')
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
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'xy',
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            },
            limits: {
              x: {min: 'original', max: 'original'},
              y: {min: 'original', max: 'original'}
            }
          }
        }
      },
      multiplyFloor: false,
      selectedTimeRange: 24, // Default to last day
      showTrendline: false,
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
    },
    selectedTimeRange() {
      this.fetchTimeSeriesData(this.maxRecord - this.selectedTimeRange)
    },
    showTrendline() {
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
        this.fetchTimeSeriesData(this.maxRecord - this.selectedTimeRange)
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
    calculateTrendline(times, values) {
      const n = times.length;
      if (n < 2) return null;

      // Convert times to numerical indices (0, 1, 2, ...)
      const x = Array.from({length: n}, (_, i) => i);
      
      // Calculate means
      const meanX = x.reduce((a, b) => a + b, 0) / n;
      const meanY = values.reduce((a, b) => a + b, 0) / n;
      
      // Calculate slope and intercept
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < n; i++) {
        numerator += (x[i] - meanX) * (values[i] - meanY);
        denominator += Math.pow(x[i] - meanX, 2);
      }
      
      const slope = numerator / denominator;
      const intercept = meanY - slope * meanX;
      
      // Generate trendline points
      return x.map(xi => slope * xi + intercept);
    },
    updateChartData(data) {
      // Store current zoom/pan state if chart exists
      let currentState = null;
      if (this.$refs.chart && this.$refs.chart.chart) {
        const chart = this.$refs.chart.chart;
        currentState = {
          zoom: {
            x: chart.scales.x.options.min,
            y: chart.scales.y.options.min
          },
          pan: {
            x: chart.scales.x.min,
            y: chart.scales.y.min
          }
        };
      }

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
          value *= (item.usd_price || 0)
        }
        collections[item.name].values.push(value)
      })

      // Create chart data with trendlines
      const labels = [...new Set(data.map(item => item.rounded_time))].sort();
      const datasets = [];

      // Add main datasets and trendlines
      Object.entries(collections).forEach(([name, data]) => {
        const color = this.getRandomColor();
        datasets.push({
          label: name,
          data: data.values,
          borderColor: color,
          tension: 0.1
        });

        if (this.showTrendline) {
          const trendlineData = this.calculateTrendline(data.times, data.values);
          if (trendlineData) {
            datasets.push({
              label: `${name} Trend`,
              data: trendlineData,
              borderColor: color,
              borderDash: [5, 5],
              borderWidth: 1,
              pointRadius: 0,
              fill: false
            });
          }
        }
      });

      this.chartData = {
        labels,
        datasets
      }

      // Restore zoom/pan state if it existed
      if (currentState) {
        this.$nextTick(() => {
          const chart = this.$refs.chart.chart;
          if (currentState.zoom.x !== undefined) {
            chart.scales.x.options.min = currentState.zoom.x;
            chart.scales.x.options.max = currentState.zoom.x;
          }
          if (currentState.zoom.y !== undefined) {
            chart.scales.y.options.min = currentState.zoom.y;
            chart.scales.y.options.max = currentState.zoom.y;
          }
          chart.update('none');
        });
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

.switch-label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-family: var(--lcars-font);
  cursor: pointer;
}

.switch-text {
  font-size: 14px;
  white-space: nowrap;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2b2b2b;
  transition: .4s;
  border-radius: 24px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.switch-input:checked + .switch-slider {
  background-color: var(--lcars-orange);
}

.switch-input:checked + .switch-slider:before {
  transform: translateX(26px);
}

.switch-input:focus + .switch-slider {
  box-shadow: 0 0 1px var(--lcars-orange);
}

.time-range-selector {
  width: 200px;
}

.trendline-toggle {
  display: flex;
  align-items: center;
}
</style> 