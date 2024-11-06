<template>
  <div class="starmap">
  <div class="lcars-header-bar">
    <div class="title">TREK STARMAP 2024/25</div>
  </div>
    <div class="starmap-container">
      <div id="trek-starmap" ref="plotDiv"></div>
      <!-- Add a modal or popup for showing details -->
      <div v-if="selectedPoint" class="details-popup" :style="popupStyle">
        <div class="popup-content">
          <h3>{{ selectedPoint.title }}</h3>
          <p>{{ selectedPoint.date }}</p>
          <a v-if="selectedPoint.url" 
             :href="selectedPoint.url" 
             target="_blank" 
             class="details-link">
            View Details
          </a>
          <button @click="selectedPoint = null" class="close-btn">×</button>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script>
  import Plotly from 'plotly.js-dist'
  
  export default {
    name: 'TrekStarmap',
    data() {
      return {
        plot: null,
        selectedPoint: null,
        popupPosition: { x: 0, y: 0 },
        roadmapData: {
          x: [0, 1, 2, 3, // top row
              4, 5, 6, 7, // second row
              8, 9, 10, 11, // third row
              12, 13, 14, 15], // bottom row
          y: [1, 4, -3, -6, // top row
              2, 5, -4, -7, // second row
              1, 4, -3, -6, // third row
              2, 5, -4, -7], // bottom row
          labels: [
            "Add Wallet generator<br>to Seimap",
            "Add in all NFTs<br>(Pallet)",
            "Add in Seipex<br>Coin Tracker",
            "Add in daily<br>NFT price tracker",
            "Fix WARP BOIS<br>metadata",
            "Improved Alliances/WL<br>collabs",
            "Incorporate ad space<br>in Seimap",
            "Resurrect Seiview",
            "Add in Seimap<br>Bonkers-style Comparison",
            "TREK 2.0 beta launched",
            "Resurrect Discord<br>Bot functionality",
            "Resurrect {Redacted}<br>other NFT product",
            "New Seipex<br>Coin Volume",
            "Partner with DeFi<br>research entity",
            "Present weekly<br>DeFi opportunities",
            "DeFi tool for<br>WARP BOIS holders"
          ],
          pointDetails: [
            {
              title: "Add Wallet generator to Seimap",
              date: "Completed: Nov 1, 2024",
              url: "https://trek.xyz/completed/wallet"
            },
            {
              title: "Add in all NFTs (Pallet)",
              date: "Completed: Oct 30, 2024",
              url: "https://trek.xyz/completed/nfts"
            },
            // ... add details for all points ...
          ]
        }
      }
    },
    mounted() {
      this.initializePlot()
      
      // Force animation on all lines after plot is created
      setTimeout(() => {
        const zeroLine = document.querySelector('#trek-starmap .zl');
        if (zeroLine) {
          zeroLine.classList.add('horizontal-line');
        }
        
        const verticalLines = document.querySelectorAll('#trek-starmap .shapelayer path');
        verticalLines.forEach(line => {
          if (line !== zeroLine) {
            line.classList.add('vertical-line');
          }
        });
      }, 100);
    },
    methods: {
      initializePlot() {
        const markerColors = Array(this.roadmapData.x.length).fill('#ffd700');
        markerColors.splice(0, 5, ...Array(5).fill('#00ffff'));
  
        const trace = {
          x: this.roadmapData.x,
          y: this.roadmapData.y,
          mode: 'markers+text',
          type: 'scatter',
          text: this.roadmapData.labels,
          textposition: this.roadmapData.y.map(y => y >= 0 ? 'top' : 'bottom'),
          textfont: {
            color: '#ffffff',
            size: 12
          },
          marker: {
            size: 24,
            color: markerColors,
            line: {
              color: '#00ff00',
              width: 0
            },
            symbol: 'circle',
            opacity: 1
          }
        }
  
        const layout = {
          title: {
            text: '',
            font: {
              color: '#ffffff',
              size: 24
            },
            y: 0.95
          },
          showlegend: false,
          xaxis: { 
            showgrid: false,
            showticklabels: false,
            zeroline: false,
            range: [-1, 16],
            fixedrange: true
          },
          yaxis: { 
            showgrid: false,
            showticklabels: false,
            zeroline: true,
            zerolinecolor: '#00ff00',
            zerolinewidth: 2,
            range: [-8, 6],
            fixedrange: true
          },
          paper_bgcolor: '#000000',
          plot_bgcolor: '#000000',
          shapes: this.generateConnectingLines(),
          margin: {
            l: 40,
            r: 40,
            t: 60,
            b: 40,
            pad: 4
          },
          autosize: true,
        }
  
        const config = {
          responsive: true,
          displayModeBar: false,
          scrollZoom: false
        }
  
        Plotly.newPlot(this.$refs.plotDiv, [trace], layout, config).then(() => {
          this.$refs.plotDiv.on('plotly_click', (data) => {
            const point = data.points[0];
            const pointIndex = point.pointIndex;
            
            this.popupPosition = {
              x: point.xaxis.d2p(point.x) + 20,
              y: point.yaxis.d2p(point.y) - 20
            };
            
            this.selectedPoint = this.roadmapData.pointDetails[pointIndex];
          });
        });
  
        window.addEventListener('resize', () => {
          Plotly.Plots.resize(this.$refs.plotDiv);
        });
      },
      generateConnectingLines() {
        const lines = []
        
        // Horizontal zeroline
        lines.push({
          type: 'line',
          x0: -2,
          x1: 17,
          y0: 0,
          y1: 0,
          line: {
            color: '#00ff00',
            width: 2,
            dash: 'dot'
          },
          class: 'horizontal-line' // Add class for horizontal animation
        })
        
        // Vertical lines
        for (let i = 0; i < this.roadmapData.x.length; i++) {
          lines.push({
            type: 'line',
            x0: this.roadmapData.x[i],
            x1: this.roadmapData.x[i],
            y0: this.roadmapData.y[i],
            y1: 0,
            line: {
              color: '#00ff00',
              width: 4,
              dash: 'dot'
            },
            class: 'vertical-line'
          })
        }
  
        return lines
      }
    },
    computed: {
      popupStyle() {
        return {
          left: `${this.popupPosition.x}px`,
          top: `${this.popupPosition.y}px`
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .starmap {
    padding: 20px;
    background-color: black;
    min-height: 100vh;
  }

  .starmap-container {
    width: 100%;
    height: calc(100vh - 60px);
    background-color: #000000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
  }
  
  #trek-starmap {
    width: 100%;
    height: 100%;
    background-color: #000000;
  }
  
  .details-popup {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid #00ff00;
    border-radius: 4px;
    padding: 15px;
    z-index: 1000;
  }
  
  .popup-content {
    color: #ffffff;
  }
  
  .details-link {
    display: inline-block;
    margin-top: 10px;
    color: #00ff00;
    text-decoration: none;
    padding: 5px 10px;
    border: 1px solid #00ff00;
    border-radius: 4px;
  }
  
  .details-link:hover {
    background: rgba(0, 255, 0, 0.1);
  }
  
  .close-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    color: #00ff00;
    font-size: 20px;
    cursor: pointer;
    padding: 0 5px;
  }
  
  .close-btn:hover {
    color: #ffffff;
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
  
  /* Animation for horizontal lines */
  :deep(.horizontal-line) {
    stroke-dasharray: 8;
    animation: dashflowHorizontal 5s linear infinite;
  }
  
  /* Animation for vertical lines - reversed direction */
  :deep(.vertical-line) {
    stroke-dasharray: 8;
    animation: dashflowVertical 5s linear infinite;
  }
  
  /* Make sure the zeroline also animates */
  :deep(.zl) {
    stroke-dasharray: 8;
    animation: dashflowHorizontal 5s linear infinite;
  }
  
  @keyframes dashflowHorizontal {
    from {
      stroke-dashoffset: 100;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  /* Reversed vertical animation */
  @keyframes dashflowVertical {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 100;
    }
  }
  </style> 